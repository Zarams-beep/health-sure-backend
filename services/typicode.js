import axios from "axios";
import config from "../config/index";
import AppError from "../utils/AppError";
import cache from "../config/cache";

const typeicodeAPI = axios.create({
    baseURL:config.TYPICODE_API_URL,
    timeout:1000,
    headers:{
        Authorization:config.TYPICODE_BASE_API_KEY,
        "Content-Type":"application/json",
    },
});

async function getPublicProfiles (userid){
    try{
        if (cache && cache.redis){
            const cachedData = await cache.redis.get(`publicProfile:${userid}`);
            if (cachedData){
                return JSON.parse(cachedData);
            }
        }

        const response = await typeicodeAPI.get(
            "/users", {params:{userid}}
        );
        if (!response) throw new AppError ("No response from Typicode API", 502);

        if (cache && cache.redis){
            await cache.redis.set(`publicProfile: ${userid}`, JSON.stringify(response), 'EX', 3600);
        }
        return response;
    } catch (error){
        console.error("Error fetching public profiles:", error);
    }
}

async function getPublicComment (commentid){
    try{
        const response = await typeicodeAPI.get("/comments", {params:{
            commentid
        }});
        return response;
    } catch (error){
        console.error("Error fetching public posts:", error);
    }
}

async function sendPublicUser(firstName, lastName) {
  try {
    const response = await typicodeAPI.post("/user", {
      firstName,
      lastName,
    });
    return response;
  } catch (error) {
    console.error("Error sending public user:", error);
  }
}

export default { getPublicProfiles, getPublicPost, sendPublicUser };
