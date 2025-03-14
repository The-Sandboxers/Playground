import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils";

import { useState } from "react";

import { requestBackend } from "../utils";


const schema = yup.object().shape({
  username: yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  passwordConf: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function RegistrationForm ({
    className,
    ...props
  }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
            mode:"onChange",
            resolver: yupResolver(schema),
            defaultValues: {
            username: "",
            email: "",
            password: "",
            passwordConf: "",
        },
  });

  const [registrationStatus, setRegistrationStatus] = useState("default");


  const onSubmit = async (signUpData) => {
    try {
      // Send POST request to the backend
      const data = await requestBackend("POST", "http://127.0.0.1:5000/register", "None", signUpData)
      console.log("Registration Succesful",data)
      setRegistrationStatus("successful")
    }catch(error){
      console.log("Registration Failed", error)
      setRegistrationStatus("unsuccessful")
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email and password below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" {...register("username")} />
                {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="passwordConf">Confirm Password</Label>
                <Input id="passwordConf" type="password" {...register("passwordConf")} />
                {errors.passwordConf && <p className="text-destructive text-sm">{errors.passwordConf.message}</p>}
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
            </div>
          </form>
          {registrationStatus === "unsuccessful" && 
            (<div className="flex flex-col gap-3">
              {/* Might want to change this s.t. the user knows why an error occurred, (account already exists, username, etc.) */}
              <p className="text-destructive text-md">There was an error registering your account.</p>
            </div>)}
          {registrationStatus === "successful" && 
          (<div className="flex flex-col gap-3">
            {/* Might want to change this s.t. the user knows why an error occurred, (account already exists, username, etc.) */}
            <p className="text-destructive text-md">Your account has been created.</p>
          </div>)}
        </CardContent>
      </Card>
    </div>
  );
};


