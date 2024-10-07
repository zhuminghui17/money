import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const { token } = req.nextauth;

        // Check if token and user exist in the token object
        if (!token || !token.user) {
            // Redirect to login or an unauthorized page as there's no user info
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        const user  = token.user;

        // // Check if the user is accessing either the checkout or settings page
        // const isAccessingAllowedPage = pathname.includes("/dashboard/checkout") || pathname.includes("/dashboard/setting");
        
        // console.log("Hawk Plan:", user);
        // // Allow access if user is a pro or is accessing allowed pages
        // if (user.isPro === true || isAccessingAllowedPage) {
        //     return NextResponse.next();
        // }

        // // Redirect non-pro users trying to access other dashboard pages to checkout
        // return NextResponse.redirect(new URL("/dashboard/checkout", req.url));
    },
    {
        callbacks: {
            authorized: ({ token }) => token?.accessToken
        }
    }
);

export const config = {
    matcher: "/dashboard/:path*"
};
