
import { pool } from "../../db/pool.js";
export type User = {
    id: string;
    username: string;
    created_at: Date;
};

export async function createUser(username: string, passwordHash: string | null = null): Promise<User> {
    const result = await pool.query<User>(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, passwordHash]
    );
    return result.rows[0];
  }
  
  export async function getAuthUser(
    username: string
  ): Promise<{ id: string; username: string; password_hash: string | null } | null> {
    const result = await pool.query<{ id: string; username: string; password_hash: string | null }>(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0] ?? null;
  }
export async function getUserById(id : string):Promise <User | null>
{
    const result = await pool.query<User>
    ( " SELECT id ,username ,created_at FROM users WHERE id =$1 ",[id]);
    return result.rows [0] ?? null ;
}

export async function listUsers(): Promise<Pick<User, "id" | "username">[]> {
    const result = await pool.query<Pick<User, "id" | "username">>(
        "SELECT id, username FROM users ORDER BY username"
    );
    return result.rows;
}