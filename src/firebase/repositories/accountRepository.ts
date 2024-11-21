import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  IUser,
  IUserLogin,
  IUserProvider,
  IUserPublic,
} from "../../interfaces/firebase/IUser";
import { doc, setDoc } from "firebase/firestore";
import userRepository from "./userRepository";

export default function accountRepository() {
  const _userRepository = userRepository();
  const login = async (data: IUserLogin) => {
    const { email, password } = data;
    return await signInWithEmailAndPassword(auth, email, password)
      .then(async ({ user }) => {
        return user;
      })
      .catch((_e: any) => {
        let e: Error = _e;
        throw new Error("Invalid email or password.");
      });
  };

  const profileUpdate = async (data: IUserPublic) => {
    if (auth.currentUser) {
      await _userRepository.update(auth.currentUser.uid, data);
      await verifyBeforeUpdateEmail(auth.currentUser, data.email);
    }
  };
  const changePassword = async (newPassword: string) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }
  };
  const signup = async (data: IUser) => {
    const {
      email,
      password,
      birthday,
      name,
      role,
      age,
      gender,
      contact,
      ministry,
      profile_picture_url,
    } = data;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      birthday: birthday,

      age: age ?? null,
      userId: user.uid,
      role: role,
      gender: gender ?? "",
      contact: contact ?? "",
      ministry: ministry ?? "",
      myPurchaseEvents: [],
      profile_picture_url: profile_picture_url ?? "",
    });
    return user;
  };

  const emailVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };
  const logout = async () => {
    await signOut(auth);
  };
  const isEmailVerified = (): boolean => {
    return !!auth.currentUser?.emailVerified;
  };

  const getCurrentUser = async () => {
    return await auth.currentUser;
  };
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };
  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    return await signInWithPopup(auth, provider);
  };
  const getUserProvider = async (): Promise<IUserProvider | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    const sortedProviders = user.providerData.sort((a, b) => {
      if (a.providerId === "password") return -1;
      if (b.providerId === "password") return 1;
      return 0;
    });
    return sortedProviders[0].providerId as IUserProvider;
  };
  return {
    getUserProvider,
    loginWithGoogle,
    loginWithFacebook,
    getCurrentUser,
    isEmailVerified,
    profileUpdate,
    changePassword,
    login,
    signup,
    logout,
    emailVerification,
  };
}
