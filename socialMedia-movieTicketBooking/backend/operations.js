import dotenv from 'dotenv';
import mysql2 from 'mysql2';


dotenv.config()


const connection=mysql2.createPool({
    host:'127.0.0.1',
    user:'root',
    password:process.env.SQL_PASSWORD,
    database:'social_media'
}).promise()

// sql operations
export async function readPosts(){
    let output= await connection.query("select * from posts")
   return output[0]
}

export async function readUser(profile){
    let output= await connection.query("select * from users where profile='"+profile+"'")
   
      return   output[0]
}

export async function insertUser(name,profile,password,headline){
  await connection.query("insert into users(name,profile,password,headline) values('"+name+"','"+profile+"','"+password+"','"+headline+"')")
    
}

export async function insertPost(profile,content){
    await connection.query("insert into posts(profile,content,likes,shares) values('"+profile+"','"+content+"',0,0)")
    
}


export async function likeFun(content){
   const output= await connection.query("select likes from posts where content='"+content+"'")
  const existLikes=output[0][0].likes
  const incLikes=existLikes+1
  await connection.query("update posts set likes="+incLikes+" where content='"+content+"'")
 
}

export async function shareFun(content){
  const output= await connection.query("select shares from posts where content='"+content+"'")

  const existShares= output[0][0].shares
   
  const incShares=existShares+1
  await connection.query("update posts set shares="+incShares+" where content='"+content+"'")
  
 
}

export async function deleteFun(content){
   await connection.query("delete from posts where content='"+content+"'")
  
}

