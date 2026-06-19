//functions/user.js
 
 
 import { getShortName } from "./utils"
 
export default function handler(request, response) {
  console.log('[user] req body', request.body);
  console.log('[user] req query', request.query);

  const name = "Rohan";

  const shortName = getShortName(name);

  const resBody = { name, shortName };
  console.log('[user] res body', resBody);

  response.status(200).send(resBody);
}
 