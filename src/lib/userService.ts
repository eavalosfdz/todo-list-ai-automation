import { supabase } from "./supabase";
import { User } from "@/types/todo";

export const userService = {
    /**
     * Get or create a user by username
     * @param username - The username to login with
     * @returns Promise with the user data
     */
    async loginUser(username: string): Promise<User> {
        // First, try to find existing user
        const { data: existingUser, error: findError } = await supabase
            .from("users")
            .select("*")
            .eq("username", username.trim())
            .single();

        if (findError && findError.code !== "PGRST116") {
            // PGRST116 is "not found" error, which is expected for new users
            console.error("Error finding user:", findError);
            throw findError;
        }

        if (existingUser) {
            return existingUser;
        }

        // Create new user if not found
        const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
                {
                    username: username.trim(),
                },
            ])
            .select()
            .single();

        if (createError) {
            console.error("Error creating user:", createError);
            throw createError;
        }

        return newUser;
    },

    /**
     * Get current user from localStorage
     * @returns User object or null if not logged in
     */
    getCurrentUser(): User | null {
        if (typeof window === "undefined") return null;

        const userData = localStorage.getItem("currentUser");
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("currentUser");
            return null;
        }
    },

    /**
     * Set current user in localStorage
     * @param user - The user object to store
     */
    setCurrentUser(user: User): void {
        if (typeof window === "undefined") return;
        localStorage.setItem("currentUser", JSON.stringify(user));
    },

    /**
     * Clear current user from localStorage (logout)
     */
    logoutUser(): void {
        if (typeof window === "undefined") return;
        localStorage.removeItem("currentUser");
    },

    /**
     * Check if user is logged in
     * @returns boolean indicating if user is logged in
     */
    isLoggedIn(): boolean {
        return this.getCurrentUser() !== null;
    },

    /**
     * Get current user ID
     * @returns user ID or null if not logged in
     */
    getCurrentUserId(): number | null {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    },
};
