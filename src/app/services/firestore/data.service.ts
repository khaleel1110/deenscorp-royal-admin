import {inject, Injectable} from '@angular/core';
import {addDoc, setDoc, Timestamp, updateDoc} from "@angular/fire/firestore";
import {BehaviorSubject} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";
import {Router} from "@angular/router";

@Injectable()
export class DataService {
    router = inject(Router);
    private isSaving = new BehaviorSubject<boolean>(false);
    private showAutoSave = new BehaviorSubject<boolean>(false);
    isSaving$ = toSignal(this.isSaving.asObservable(), {initialValue: false});
    showAutoSave$ = this.showAutoSave.asObservable();
    savingTimeOut: any;
    private documentDocRef: any;

    constructor() {
    }

    initializeDocumentRef(documentDocRef: any) {
        console.log('************** we have succedded if we get here');
        this.documentDocRef = documentDocRef;
    }

    addToDb(valueToUpdate: any, navigateUrl?: string) {
        this.showAutoSave.next(true);
        this.isSaving.next(true);

        console.log('our document id is', this.documentDocRef.id, 'data', valueToUpdate);
        return setDoc(this.documentDocRef, {...valueToUpdate}, {merge: true}).then(
            (_: any) => {
                this.isSaving.next(false);
                if (navigateUrl) {
                    this.router.navigateByUrl(navigateUrl);
                }
            }
        );
    }

    updateToDb(valueToUpdate: any) {
        this.showAutoSave.next(true);
        this.isSaving.next(true);

        return updateDoc(this.documentDocRef, {...valueToUpdate}).then(
            (_: any) => {

                this.isSaving.next(false);
            }
        );
    }


}
