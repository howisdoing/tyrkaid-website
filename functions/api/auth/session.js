import {json,validSession,makeSession,sessionCookie} from '../../_lib/auth.js';
export async function onRequestGet({request,env}){
 const authenticated=await validSession(request,env);
 if(!authenticated)return json({authenticated:false},401);
 const token=await makeSession(env.ADMIN_USERNAME,env.SESSION_SECRET);
 return json({authenticated:true},200,{'Set-Cookie':sessionCookie(token)});
}
