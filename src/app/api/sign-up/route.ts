import dbConnect from "@/lib/dbConnect";   
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {username,email,password}= await request.json()

        const existingUserVerifiedByUsername=await UserModel.findOne({
            username,
            isVerified:true
        })

        const verifyCode=Math.floor(100000 + Math.random()*900000).toString()

        if(existingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message:"Username taken"
            },{ status:400})
        }

        const existingUserVerifiedByEmail=await UserModel.findOne({
            email,
            isVerified:true
        })

        if(existingUserVerifiedByEmail){
        if(existingUserVerifiedByEmail.isVerified){
            return Response.json({
                success:false,
                message:"Email already registered"
            },{ status:400})
        }else{
            const hashedPassword=await bcrypt.hash(password,10)
            existingUserVerifiedByEmail.password=hashedPassword
            existingUserVerifiedByEmail.verifyCode=verifyCode
            existingUserVerifiedByEmail.verifyCodeExpiry=new Date(Date.now() + 3600000)
            await existingUserVerifiedByEmail.save()
        }
            
        }else{
            const hashedPassword=await bcrypt.hash(password, 10)
            const expiryDate=new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser=new UserModel({
                username,
                  email,
                  password: hashedPassword,
                  verifyCode,
                  verifyCodeExpiry: expiryDate, 
                  isVerified: false,
                  isAcceptingMessages: true,
                  messages: []
            })

            await newUser.save()
        }

        // Send verification email
    const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
    );
    if (!emailResponse.success) {
        return Response.json(
            {
            success: false,
            message: emailResponse.message,
            },
            { status: 500 }
        );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your email.',
      },
      { status: 201 }
    );

    } catch (error) {
        console.log("Error registering user ",error)
        return Response.json(
            {
                success:false,
                message:"Error registering user"
            },
            {
                status:500
            }
        )
    }
}