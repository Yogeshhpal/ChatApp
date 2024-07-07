import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import CheckEmail from "../pages/CheckEmail";
import CheckPassword from "../pages/CheckPassword";
import Home from "../pages/Home";
import MessagePage from "../components/MessagePage";
import AuthLayouts from "../layout";
import ForgotPassword from "../pages/ForgotPassword";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "register",
                element: <AuthLayouts><RegisterPage /></AuthLayouts>
            },
            {
                path: "email",
                element: <AuthLayouts><CheckEmail /></AuthLayouts>
            },
            {
                path: "password",
                element: <AuthLayouts><CheckPassword /></AuthLayouts>
            },
            {
                path: "forgot-password",
                element: <AuthLayouts><ForgotPassword /></AuthLayouts>
            },
            {
                path: "",
                element: <Home />,
                children: [
                    {
                        path: ":userId",
                        element: <MessagePage />
                    }
                ]
            }
        ]
    },
])

export default router;




