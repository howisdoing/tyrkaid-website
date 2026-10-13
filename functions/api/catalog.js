import {json} from '../_lib/auth.js';
import {allCatalog} from '../_lib/db.js';
export async function onRequestGet({env}){try{return json(await allCatalog(env.DB),200,{'Cache-Control':'public, max-age=60'})}catch(e){return json({error:e.message},500)}}
