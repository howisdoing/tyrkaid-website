import {json,validSession} from '../../_lib/auth.js';
export async function onRequestGet({request,env}){return json({authenticated:await validSession(request,env)})}
