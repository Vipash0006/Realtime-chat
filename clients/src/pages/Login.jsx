import React, { useState, useEffect } from 'react';
import { GoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import { googleAuth, loginUser, validUser } from '../apis/auth';
import { Link, useNavigate } from 'react-router-dom';
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs";
import { toast } from 'react-toastify';

const defaultData = { email: "", password: "" };

function Login() {
  const [formData, setFormData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const pageRoute = useNavigate();

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    if (formData.email.includes("@") && formData.password.length > 6) {
      setIsLoading(true);
      try {
        const res = await loginUser(formData);
        if (res?.token) {
          localStorage.setItem("userToken", res.token);
          toast.success("Successfully Logged In!");
          pageRoute("/chats");
        } else {
          toast.error("Invalid response from server");
          setFormData({ ...formData, password: "" });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Server not responding";
        toast.error(`Login failed: ${errorMessage}`);
        setFormData({ ...formData, password: "" });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.warning(formData.password.length <= 6 
        ? "Password must be longer than 6 characters" 
        : "Please enter a valid email address");
    }
  };

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Google Client ID is not set in environment variables");
      return;
    }

    const initGoogleAuth = async () => {
      try {
        await gapi.load('client:auth2', () => {
          gapi.client.init({
            clientId: clientId,
            scope: 'email profile',
          }).then(() => {
            console.log("✅ Google API Initialized");
          }).catch(err => {
            console.error("❌ Google API Init Error:", err);
          });
        });
      } catch (error) {
        console.error("Failed to initialize Google Auth:", error);
      }
    };

    initGoogleAuth();

    const checkValidUser = async () => {
      try {
        const data = await validUser();
        if (data?.user) {
          pageRoute("/chats");
        }
      } catch (err) {
        console.warn("⚠️ User not valid or token missing");
      }
    };

    checkValidUser();
  }, []);

  const googleSuccess = async (res) => {
    if (res?.profileObj) {
      setIsLoading(true);
      try {
        const response = await googleAuth({ tokenId: res.tokenId });
        if (response?.token) {
          localStorage.setItem("userToken", response.token);
          toast.success("Successfully Logged In!");
          pageRoute("/chats");
        }
      } catch (err) {
        toast.error("Google login failed.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const googleFailure = () => {
    toast.error("Google login unsuccessful. Try again!");
  };

  return (
    <div className='bg-[#121418] w-[100vw] h-[100vh] flex justify-center items-center'>
      <div className='w-[90%] sm:w-[400px] h-[400px] relative mt-20'>
        <div className='absolute -top-5 left-0'>
          <h3 className='text-[25px] font-bold tracking-wider text-white'>Login</h3>
          <p className='text-white text-[12px] tracking-wider font-medium'>
            No Account? <Link className='text-[rgba(0,195,154,1)] underline' to="/register">Sign up</Link>
          </p>
        </div>

        <form className='flex flex-col gap-y-3 mt-[12%]' onSubmit={formSubmit}>
          <input className="w-full sm:w-[80%] bg-[#222] h-[50px] pl-3 text-white" onChange={handleOnChange} name="email" type="text" placeholder='Email' value={formData.email} required />

          <div className='relative'>
            <input className='w-full sm:w-[80%] bg-[#222] h-[50px] pl-3 text-white' onChange={handleOnChange} type={showPass ? "text" : "password"} name="password" placeholder='Password' value={formData.password} required />
            <button type='button'>
              {showPass ? (
                <BsEmojiExpressionless onClick={() => setShowPass(!showPass)} className='text-white absolute top-3 right-5 sm:right-24 w-6 h-5' />
              ) : (
                <BsEmojiLaughing onClick={() => setShowPass(!showPass)} className='text-white absolute top-3 right-5 sm:right-24 w-6 h-5' />
              )}
            </button>
          </div>

          <button style={{ background: "linear-gradient(90deg, rgba(0,195,154,1) 0%, rgba(224,205,115,1) 100%)" }} className='w-full sm:w-[80%] h-[50px] font-bold text-[#121418] tracking-wide text-[17px] relative' type='submit'>
            {isLoading ? (
              <div className='absolute -top-[53px] left-[27%] sm:left-[56px]'>
                <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_h9kds1my.json" background="transparent" speed="1" style={{ width: "200px", height: "160px" }} loop autoplay />
              </div>
            ) : (
              <p className='text-white'>Login</p>
            )}
          </button>

          <p className='text-white text-center sm:-ml-20'>/</p>

          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            render={(renderProps) => (
              <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="py-3.5 px-4 border rounded-lg flex items-center w-full sm:w-[80%]" style={{ borderImage: "linear-gradient(to right, rgba(0,195,154,1) 50%, rgba(224,205,115,1) 80%)", borderImageSlice: "1" }}>
                <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/sign_in-svg2.svg" alt="google" />
                <p className="text-base font-medium ml-4 text-white">Continue with Google</p>
              </button>
            )}
            onSuccess={googleSuccess}
            onFailure={googleFailure}
            cookiePolicy={'single_host_origin'}
            scope="profile email https://www.googleapis.com/auth/user.birthday.read"
          />
        </form>
      </div>
    </div>
  );
}

export default Login;
