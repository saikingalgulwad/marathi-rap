"use client"
import React,{useState} from 'react'
import UploadImage from './UploadImage'
import { useSession} from "next-auth/react"

import UserTag from './UserTag'


import { useRouter } from 'next/navigation'
import Image from 'next/image'

function Form() {
    const {data:session}=useSession();
    const [title,setTitle]=useState();
    const [desc,setDesc]=useState();
    const [link,setLink]=useState();
    const [file,setFile]=useState();
    const [loading,setLoading]=useState(false);
    const router=useRouter();
  
    const postId=Date.now().toString();
    const onSave=()=>{
      
       setLoading(true);
       uploadFile();
   

    }

    const uploadFile=async()=>{
      if(session?.user){
        await fetch("https://saikingnext.vercel.app/api/usersPost",{
          method:"POST",
          body: JSON.stringify({ title:title,desc:desc,link:link,image:file,userName:session.user.name,email:session.user.email,userImage:session.user.image,data:postId }),
        })
        setLoading(false);
        router.push('/'+session.user.email);
       
      }
    }

   
   
  return (
    <div className=' bg-white p-16 rounded-2xl '>
        <div className='flex justify-end mb-6'>
            <button onClick={()=>onSave()}
             className='bg-red-500 p-2
            text-white font-semibold px-3 
            rounded-lg'>
              {loading?  <Image src="/loading-indicator.png" 
                width={30} 
                height={30} 
                alt='loading'
                className='animate-spin'  />:
                <span>Save</span>}</button>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
           
            <UploadImage setFile={(file)=>setFile(file)} />
          
       <div className="col-span-2">
       <div className='w-[100%]'>
        <input type="text" placeholder='Add your title'
            onChange={(e)=>setTitle(e.target.value)}
        className='text-[35px] outline-none font-bold w-full
        border-b-[2px] border-gray-400 placeholder-gray-400'/>
        <h2 className='text-[12px] mb-8 w-full  text-gray-400'>The first 40 Charaters are 
        what usually show up in feeds</h2>
        <UserTag user={session?.user} />
        <textarea type="text"
          onChange={(e)=>setDesc(e.target.value)}
            placeholder='Tell everyone what your pin is about' 
        className=' outline-none  w-full mt-8 pb-4 text-[14px]
        border-b-[2px] border-gray-400 placeholder-gray-400'/>
          <input type="text"
          onChange={(e)=>setLink(e.target.value)}
           placeholder='Add a Destination Link' 
        className=' outline-none  w-full  pb-4 mt-[90px]
        border-b-[2px] border-gray-400 placeholder-gray-400'/>
    </div>
       </div>
        
        </div>
    </div>
  )
}

export default Form
