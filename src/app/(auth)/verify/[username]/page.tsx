'use client'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { verifySchema } from '@/schemas/verifySchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from "sonner"
import * as z from 'zod'

const VerifyAccount = () => {
    const router=useRouter()
    const params=useParams<{username:string}>()

    const form=useForm<z.infer<typeof verifySchema>>({
        resolver:zodResolver(verifySchema),
      })

    const onSubmit = async(data : z.infer<typeof verifySchema>)=>{
        try {
            const response=await axios.post(`/api/verify-code`,
                {
                    username:params.username,
                    code:data.code
                }
            )
            if(!response){
              toast('Incorrect verify code')
            }
            toast(response.data.message)
            router.replace('/dashboard')
        } catch (error) {
            console.error("Error in signup user")
                const axiosError=error as AxiosError<ApiResponse>
                toast(axiosError.response?.data.message)
            }
    }
   
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} placeholder='Enter your verification code'/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );

  
}


export default VerifyAccount