//functions/user.js
 
 
 import { getShortName } from "./utils"
 
 export default function handler(request, response) {
 
   const name = "Rohan";
 
   const shortName = getShortName(name);
 
   response.status(200).send({ name, shortName});
 
 }
 