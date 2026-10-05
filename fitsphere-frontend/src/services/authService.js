import api, { session } from "./api";

/**
 * Backend contract (confirmed in openapi.json):
 *   POST /auth/login?email=..&password=..   -> { access_token, token_type, user_id, name, role }
 *   POST /users/   (JSON)                    -> UserResponse
 *   GET  /auth/me                            -> profile (incl. profile_picture)
 *   PUT  /users/me                           -> updated profile
 *   POST /users/me/profile-picture (multipart "file")
 *
 * NOTE: the backend takes login credentials as QUERY PARAMETERS. We send them
 * with axios `params` (properly URL-encoded) over a POST. This is the backend's
 * contract; see README "Known issues" about moving it to a JSON body.
 */

// Frontend goal labels  <->  backend goal codes used by the recommendation service
const GOAL_TO_API = {
  "Weight Loss": "weight_loss",
  "Muscle Gain": "muscle_gain",
  "Maintain Fitness": "maintain",
};
const GOAL_FROM_API = Object.fromEntries(
  Object.entries(GOAL_TO_API).map(([label, code]) => [code, label])
);

export const toProfileUI = (u) => ({
  id: u.id,
  name: u.name || "",
  email: u.email || "",
  role: u.role || "",
  age: u.age ?? "",
  gender: u.gender ?? "",
  height: u.height ?? "",
  weight: u.weight ?? "",
  goal: GOAL_FROM_API[u.goal] || u.goal || "",
  profilePicture: u.profile_picture || null,
});

export async function login(email, password) {
  const { data } = await api.post("/auth/login", null, { params: { email, password } });
  session.save({ token: data.access_token, userId: data.user_id, role: data.role });
  return data;
}

export async function register({ name, email, password }) {
  const { data } = await api.post("/users/", { name, email, password });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  session.save({ userId: data.id, role: data.role });
  return toProfileUI(data);
}

export async function updateProfile(p) {
  const num = (v) => (v === "" || v == null ? null : Number(v));
  const { data } = await api.put("/users/me", {
    age: num(p.age),
    gender: p.gender || null,
    height: num(p.height),
    weight: num(p.weight),
    goal: GOAL_TO_API[p.goal] || p.goal || null,
  });
  return toProfileUI(data);
}

export async function uploadProfilePicture(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/users/me/profile-picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.profile_picture;
}

export async function deleteProfilePicture() {
  await api.delete("/users/me/profile-picture");
}

export function logout() {
  session.clear();
}
