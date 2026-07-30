import {computed, Injectable, Signal} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";

@Injectable()
export class PaginationService {


  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  public isLoading: Signal<boolean> = toSignal(this.isLoadingSubject.asObservable(), {initialValue: true});

  private currentPageSubject = new BehaviorSubject<number>(1);
  public currentPage: Signal<number> = toSignal(this.currentPageSubject.asObservable(), {initialValue: 1});

  private itemsPerPageSubject = new BehaviorSubject<number>(20);
  public itemsPerPage: Signal<number> = toSignal(this.itemsPerPageSubject.asObservable(), {initialValue: 20});

  private totalCountSubject = new BehaviorSubject<number>(1);
  public totalCount: Signal<number> = toSignal(this.totalCountSubject.asObservable(), {initialValue: 1});



  setItemsPerPage(currentNumber: number) {
    this.currentPageSubject.next(1);
    this.itemsPerPageSubject.next(currentNumber);
  }

  setCurrentPage(currentNumber: number) {
    this.currentPageSubject.next(currentNumber);
  }

  setTotalCount(total: number) {
    this.totalCountSubject.next(total);
  }

  nextPage(): void {
    this.setCurrentPage(this.currentPage() - 1);
  }

  prevPage(): void {
    this.setCurrentPage(this.currentPage() - 1);
  }

  reset(): void {
    this.itemsPerPageSubject.next(20);
    this.currentPageSubject.next(1);
  }
}
