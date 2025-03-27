import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AppNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // JSON array for button names and routes
    const navItems = [
        { name: "Profile", route: "/application/profile" },
        { name: "Home", route: "/application/recs" },
        // Add more buttons as needed
    ];

    return (
        <div>
            <nav className="bg-primary border-background z-10 top-0 left-0 w-full mb-8">
                <div className="max-w-screen flex flex-wrap items-center justify-between mx-8 p-4">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-primary-foreground dark:text-primary">
                        Playground
                    </span>
                    <div>
                        {navItems.map((item, index) => (
                            <Button
                                key={index}
                                size="lg"
                                variant={location.pathname === item.route ? 'default' : 'secondary'} // Change variant if the route matches
                                className="font-black text-md"
                                onClick={() => navigate(item.route)}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
}
