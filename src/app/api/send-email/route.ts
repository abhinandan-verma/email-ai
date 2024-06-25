import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "22cs011@jssaten.ac.in",
      pass: process.env.PASSWORD,
    },
  });

export  async function POST(req: NextRequest) {
    
    if (transporter == null) { 
        return NextResponse.json(
            {
                status: "error",
                message: "Transporter not set",
            },
            {
                status: 500,
            }
        )
    }




    try {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: {
                name: "Abhinandan Verma",
                address: "22cs011@jssaten.ac.in"
            }, // sender address
            to: "abhinandanverma551@gmail.com", // list of receivers
            subject: "Hello Abhinandan", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });

        if (info && info.messageId) {
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
            return NextResponse.json(
                {
                    status: "success",
                    message: "Email sent successfully",
                    email: nodemailer.getTestMessageUrl(info)
                },
                {
                    status: 200,
                }
            )
    
        }
        
        
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(
            {
                status: "error",
                message: "Email not sent",
            },
            {
                status: 500,
            }
        )

    } finally {
        transporter.close();

        console.log("Transporter closed")
    }
}
    