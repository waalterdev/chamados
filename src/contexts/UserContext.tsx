import { createContext, useContext, useState } from "react";
import { v4 as uuid } from "uuid";

export type Roles = "default" | "admin" | "super"

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

export type User = {
    username: string;
    password: string;
    id: string;
    role: Roles;
}

export type NewUser = {
    username: string;
    password: string;
}

interface UserContextProps {
    user: User | null;
    login: (username: string, password: string) => Promise<ServiceResult<User>>;
    register: (username: string, password: string) => Promise<ServiceResult<User>>;
    changeRole: (userId: string, newRole: Roles) => Promise<ServiceResult<User>>;
    logout: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [loggedUser, setLoggedUser] = useState<User | null>(() => {
        const storedData = JSON.parse(localStorage.getItem("Current@User") || "null");

        return storedData;
    });

    function getUsers(): User[] {
        const storedUsers = JSON.parse(localStorage.getItem("Db@Users") || "[]");
        return storedUsers;
    }

    function saveUsers(users: User[]) {
        localStorage.setItem("Db@Users", JSON.stringify(users));
        console.log("Tabela de usuários atualizada.")
    }

    const register = async (username: string, password: string): Promise<ServiceResult<User>> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = getUsers();

        if (users.some(u => u.username === username)) {
            return { success: false, error: "Usuario já existente." }
        }

        const newUser: User = {
            id: uuid(),
            username,
            password,
            role: "default"
        }

        users.push(newUser);
        saveUsers(users);

        return { success: true, data: newUser }
    }

    const login = async (username: string, pass: string): Promise<ServiceResult<User>> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = getUsers();
        
        const foundUser = users.find(u => u.username === username);

        if (!foundUser) return { success: false, error: "Usuário não encontrado." };

        if (foundUser.password !== pass) return { success: false, error: "Credencial incorreta." };

        const { password, ...userWithoutPass } = foundUser

        setLoggedUser(foundUser);

        localStorage.setItem("Current@User", JSON.stringify(userWithoutPass));

        return { success: true, data: foundUser };
    }

    const changeRole = async (userId: string, newRole: Roles): Promise<ServiceResult<User>> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = getUsers();

        const foundUser = users.find(u => u.id === userId);

        if (!foundUser) return { success: false, error: "Usuário não encontrado" };

        foundUser.role = newRole;

        saveUsers(users);

        return { success: true, data: foundUser };
    }

    const logout = () => {
        setLoggedUser(null);
        localStorage.removeItem("Current@User");
    }

    return (
        <UserContext.Provider
            value={{
                user: loggedUser,
                register,
                login,
                changeRole,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) throw new Error("Inicialize o Provider do userContext antes de utilizar.");

    return context;
}