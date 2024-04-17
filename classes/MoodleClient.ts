import os from "os";
import fs from "fs";
import { URLSearchParams } from "url";
import debug from "debug";

import {
  IMoodleClientOptions,
  IMoodleWSDefinition,
  IMoodleWSFn,
  IMoodleWSAPI,
  IMoodleWSParams,
} from "../interfaces";

import IMoodleWSAuthResponse from "../interfaces/IMoodleWSAuthResponse";

//Load package info
import pkg from "../package.json";
import path from "path";
import NameValuePair from "../types/NameValuePair";
import MoodleError from "./MoodleError";

interface IExtMoodleWSAPI extends IMoodleWSAPI {
  [k: string]: any;
}

//Load function definitions
const json = fs.readFileSync(
  path.resolve(__dirname, "../api", "functions.json"),
  "utf8"
);
const definition: IMoodleWSDefinition = JSON.parse(json);

type AnyObject = { [key: string]: any };
type Diggable = string | AnyObject;

export class MoodleClient {
  private _definition?: IMoodleWSDefinition;
  private _functions?: string[];
  public api!: IExtMoodleWSAPI;

  constructor(public options: IMoodleClientOptions) {
    //Check the URL syntax
    if (!/^https?:\/\//g.test(options.baseUrl)) {
      throw new Error("Argument 'options.baseUrl' must be a URL string.");
    }

    //Check the URL syntax
    if (options.baseUrl.includes("server.php")) {
      throw new Error(
        "Argument 'options.baseUrl' should NOT contain the complete URL. Hint: provide base URL such as https://mooodle.example.com"
      );
    }
    this._loadApi();

    //Sanitize base URL - trim trailing slash
    options.baseUrl = options.baseUrl.trim().replace(/\/$/g, "");
  }

  private _loadApi() {
    //Store definition into the instance
    this._definition = definition;

    //List of generated functions
    this._functions = [];

    //Bind Moodle Web Service functions, e.g. core_user_create_users => core.user.createUsers()
    this.api = { config: { token: this.options.token } } as any;
    const client = this;
    const api = this.api as IExtMoodleWSAPI;
    for (let item of this._definition.items) {
      //Create a new module
      if (!api[item.module]) {
        api[item.module] = {};
      }
      //Create a new facility
      if (!api[item.module][item.facility]) {
        api[item.module][item.facility] = {};
      }
      //Create a new function
      if (!api[item.module][item.facility][item.preferName]) {
        this._functions.push(
          item.module + "." + item.facility + "." + item.preferName
        );
        api[item.module][item.facility][item.preferName] = function (
          params: IMoodleWSParams
        ) {
          return client._request(item, params);
        };
      }
    }
  }

  private static _buildUserAgent(): string {
    return (
      pkg.name +
      "/" +
      pkg.version +
      " (node.js " +
      process.version +
      "; " +
      os.platform() +
      " " +
      os.release() +
      ")"
    );
  }

  get userAgent() {
    //Build User-Agent string
    let userAgent = this.options.userAgent;
    if (!userAgent) userAgent = MoodleClient._buildUserAgent();
    return userAgent;
  }

  public static flatten(data: any) {
    let result: AnyObject = {};

    function dig(d: Diggable, prefix: string) {
      if (typeof d === "string" || typeof d === "number") {
        result[prefix] = d;
        return;
      }

      for (let key in d as AnyObject) {
        let item = (d as AnyObject)[key];
        if (item === null) {
          continue;
        } else if (item instanceof Array) {
          for (var i = 0; i < item.length; i++) {
            dig(
              item[i],
              prefix.length === 0
                ? prefix + key + "[" + i + "]" //Root level has no square brackets
                : prefix + "[" + key + "][" + i + "]" //Deeper levels must include brackets
            );
          }
        } else if (typeof item === "object") {
          for (let i in item as AnyObject) {
            dig(item, prefix + key + "[" + i + "]");
          }
        } else {
          result[prefix + "[" + key + "]"] = item;
        }
      }
    }

    dig(data, "");
    return result;
  }

  public static async authenticate({
    baseUrl,
    credentials,
    userAgent,
  }: Omit<IMoodleClientOptions, "token">) {
    let options: RequestInit;
    // if (!payload.body) {
    //No data to be sent
    options = {
      method: "GET",
      headers: {
        "User-Agent": userAgent ?? MoodleClient._buildUserAgent(),
        Accept: "application/json",
      },
    };

    let form: URLSearchParams | "" = new URLSearchParams({
      ...credentials,
      service: credentials?.service ?? "moodle_mobile_app",
    } as any);

    let url = baseUrl + "login/token.php?" + form;
    const res = await fetch(url, options);
    const result = await res.json();
    if (typeof result.error === "string") {
      throw new MoodleError(result);
    }
    return result as IMoodleWSAuthResponse;
  }

  private static _format(data: { [k: string]: number | string | any[] }): any {
    const moodleData: NameValuePair<string, string>[] = [];
    for (const key of Object.keys(data)) {
      const currentItem = data[key];
      if (currentItem instanceof Array) {
        for (const value of currentItem) {
          moodleData.push({ name: key, value: `${value}` });
        }
      } else {
        moodleData.push({ name: key, value: data[key] as string });
      }
    }
    return { data: moodleData };
  }

  private static _prepareParams(params: IMoodleWSParams): URLSearchParams {
    let finalParams: IMoodleWSParams;
    finalParams = { ...params };
    delete finalParams.token; //Getting rid of the token
    for (const key of Object.keys(params)) {
      const item = finalParams[key];
      if (item instanceof Array) {
        delete finalParams[key];
        finalParams = {
          ...finalParams,
          ...MoodleClient.flatten({ [key]: item }),
        };
      }
    }
    if (finalParams.data)
      finalParams = {
        ...finalParams,
        ...MoodleClient.flatten(MoodleClient._format(params.data)),
      };
    return new URLSearchParams(finalParams as any);
  }

  private _request(
    item: IMoodleWSFn,
    params?: IMoodleWSParams
  ): Promise<AnyObject | Error> {
    return new Promise(async (resolve, reject) => {
      let fnDebugger: debug.Debugger;
      try {
        //Get web service functio name
        let wsfunction = null;
        wsfunction = item.name;
        fnDebugger = debug(`moodle:api:${item.module}:${item.facility}`);
        fnDebugger(`Calling ${item.preferName}...`);

        //Verify if function name is set
        if (!wsfunction || wsfunction.length === 0) {
          throw new Error("Web Service function not defined: " + item);
        }

        //Build request options
        let options: RequestInit | null = null;

        //No data to be sent
        options = {
          method: "GET",
          headers: {
            "User-Agent": this.userAgent,
            Accept: "application/json",
          },
        };

        let form: URLSearchParams | "" = "";
        if (params) form = MoodleClient._prepareParams(params);

        //Complete the URL
        let url =
          this.options.baseUrl +
          "/webservice/rest/server.php?wstoken=" +
          (params?.token ?? this.api.config.token ?? "") +
          "&moodlewsrestformat=json&wsfunction=" +
          wsfunction +
          "&" +
          form;

        //Make a HTTP request
        let res = await fetch(url, options);

        //Expected JSON as data object
        let result = await res.json();

        //Moodle always returns HTTP status code 200
        //Error can be detected by object properties
        if (typeof result.exception === "string") {
          throw new MoodleError(result);
        }

        //Success
        fnDebugger!(
          `Successfully called ${item.preferName} with parameters: ${
            JSON.stringify(params) ?? "null"
          }.`
        );
        resolve(result as AnyObject);
      } catch (err) {
        fnDebugger!(
          `Failed to call ${item.preferName} with parameters: ${JSON.stringify(
            params
          )}.`
        );
        reject(err as Error);
      }
    });
  }
}

const MoodleApi = (options: Omit<IMoodleClientOptions, "credentials">) => {
  return new MoodleClient(options).api;
};

export default MoodleApi;
