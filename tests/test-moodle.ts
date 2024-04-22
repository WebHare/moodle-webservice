import { MoodleApi } from "..";

async function main() {
  if(!process.env.MOODLE_BASEURL)
    throw new Error('MOODLE_BASEURL is not set')
  if(!process.env.MOODLE_TOKEN)
    throw new Error('MOODLE_TOKEN is not set')

  const moodle = MoodleApi({
    baseUrl: process.env.MOODLE_BASEURL,
    token: process.env.MOODLE_TOKEN
  });
  console.log(await moodle.core.webservice.getSiteInfo());
}

main();
