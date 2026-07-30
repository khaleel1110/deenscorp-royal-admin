import {inject, Injectable, Signal} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Auth, getIdTokenResult, onAuthStateChanged} from "@angular/fire/auth";
import {User} from "firebase/auth";
import {doc, Firestore, getDoc, onSnapshot, Unsubscribe} from "@angular/fire/firestore";
import {toSignal} from "@angular/core/rxjs-interop";

interface Company {
    id: string;
    name: string;
    logo: string;
    email: string;
    address: string;
    counters: {
        invoices: number,
        customers:number,
        expenses: number,
        payments:number,
        salesReceipts: number,
        quotations: number

    },
}

/*
* company: {
      companyName: "Arewa Textile Kaduna Ltd",
      address: 'No. 15 Sabongari, Zaria, Kaduna',
      logo:'/arewa-text-logo2.png'
    }*/

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    private auth = inject(Auth);


    private CompanyIdSubject = new BehaviorSubject<string | null>(null);
    private CompanySubject = new BehaviorSubject<Company | null>(null);
    private isLoadingSubject = new BehaviorSubject<boolean>(true);

    // Public Observables
    companyId: Signal<string | null> = toSignal(this.CompanyIdSubject.asObservable(), {initialValue: null});
    company: Signal<Company | null> = toSignal(this.CompanySubject.asObservable(), {initialValue: null});
    isLoading: Signal<boolean> = toSignal(this.isLoadingSubject.asObservable(), {initialValue: false});

    private CompanyDocListener: (() => void) | null = null;
    private userSubscription?: Unsubscribe;
    private CompanySubscription?: Unsubscribe;


    constructor() {
        this.isLoadingSubject.next(true);
        //console.log('Identity Service created');
        this.userSubscription = onAuthStateChanged(this.auth, (user: User | null) => {
            this.isLoadingSubject.next(true);

            if (user) {
   /*             this.processUserWithCache(user);*/
            } else {
                this.cleanup();
            }
        });
    }

/*    async processUserWithCache(user: User) {
        try {
            const idTokenResult = await getIdTokenResult(user);
            const claims = idTokenResult.claims;
            const CompanyId = claims['companyId'] as string;
            console.log('Loaded CompanyId:', CompanyId);

            this.setCompanyId(CompanyId);

            // Check local storage for cached Company data
            const cachedCompany = localStorage.getItem(`company_${CompanyId}`);
            if (cachedCompany) {
                console.log('Using cached company data');
                this.setCompany(JSON.parse(cachedCompany));
                this.isLoadingSubject.next(false);
            } else {
                console.log('Fetching company data from Firestore');
                this.fetchCompanyDetails(CompanyId);
            }

            // Listen for live updates and update the cache
            if (this.CompanySubscription) {
                this.CompanySubscription(); // Unsubscribe from any existing subscription
            }

            this.CompanySubscription = onSnapshot(
                doc(this.firestore, 'companies', CompanyId),
                (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const Company = docSnapshot.data() as Company;
                        console.log('Fetched live company data:', Company);

                        // Update local storage
                        localStorage.setItem(`company_${CompanyId}`, JSON.stringify(Company));
                        this.setCompany(Company);
                    } else {
                        console.log('No such Company document!');
                        this.setCompany(null);
                    }
                    this.isLoadingSubject.next(false);
                },
                (error) => {
                    console.error('Error listening to Company details:', error);
                    this.isLoadingSubject.next(false);
                }
            );
        } catch (error) {
            console.error('Error processing user claims or company details:', error);
            this.reset();
        }
    }*/

/*    fetchCompanyDetails(CompanyId: string) {
        const docRef = doc(this.firestore, 'companies', CompanyId);
        getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const Company = docSnapshot.data() as Company;
                    console.log('Fetched company data from Firestore:', Company);

                    // Cache the data
                    localStorage.setItem(`company_${CompanyId}`, JSON.stringify(Company));
                    this.setCompany(Company);
                } else {
                    console.log('No such Company document!');
                    this.setCompany(null);
                }
                this.isLoadingSubject.next(false);
            })
            .catch((error) => {
                console.error('Error fetching Company details:', error);
                this.isLoadingSubject.next(false);
            });
    }*/

    getCompanyId(){
        return this.CompanyIdSubject.value;
    }
    cleanup() {
        if (this.CompanySubscription) {
            this.CompanySubscription(); // Unsubscribe
        }
        this.reset();
    }
    setCompanyId(CompanyId: string | null): void {
        this.CompanyIdSubject.next(CompanyId);
    }

    setCompany(Company: Company | null): void {
        this.CompanySubject.next(Company);
    }


    // Reset method to clear all data
    reset(): void {

        this.CompanyIdSubject.next(null);
        this.CompanySubject.next(null);


        // Unsubscribe from Firestore listener if it exists
        if (this.CompanyDocListener) {
            this.CompanyDocListener();
            this.CompanyDocListener = null;
        }
    }


}
