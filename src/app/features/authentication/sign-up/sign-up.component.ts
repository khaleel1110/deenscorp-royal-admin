import {Component, inject} from '@angular/core';
import { GoogleAuthProvider } from "firebase/auth";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Auth, signInWithPopup, updateProfile, User} from "@angular/fire/auth";
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

@Component({
  selector: 'yex-sign-up',
  standalone: true,
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private auth = inject(Auth);
  profileForm = new FormGroup({
    fullname: new FormControl('', [Validators.required, Validators.email]),
    lastname: new FormControl('', [Validators.required, Validators.email]),
    email: new FormControl('', [Validators.required, Validators.email]),


    password: new FormControl('',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]),
    confirmPassword: new FormControl('',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]),

  });
/*

  handleSubmit() { alert( this.profileForm.value.fullname+' '+this.profileForm.value.lastname+' '+
    this.profileForm.value.email+' '+this.profileForm.value.password+' '+this.profileForm.value.confirPassword+" successfully"
  )

  }*/

  createAccount() {
    createUserWithEmailAndPassword(this.auth, this.profileForm.value.email as string, this.profileForm.value.password as string)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user  ;
        updateProfile(this.auth.currentUser as User, {
          displayName: `${this.profileForm.value.fullname} ${this.profileForm.value.lastname}`,
          photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(() => {
          // Profile updated!
          // ...
        }).catch((error) => {
          // An error occurred
          // ...
        });
        // IdP data available using getAdditionalUserInfo(result)
        /*this.router.navigateByUrl("/admin/dashboard")*/
        alert('user created in')
        // ...
      }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.

      alert(errorMessage);
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }
}

