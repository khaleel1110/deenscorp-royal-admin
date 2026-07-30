import {Component} from '@angular/core';
import {NgbDropdown, NgbDropdownMenu} from "@ng-bootstrap/ng-bootstrap";
import {NgFor} from '@angular/common';



interface NotificationItem {
  id: string;
  checked: boolean;
  avatar: {
    type: 'image' | 'initials' | 'icon';
    value: string;
    class?: string;
  };
  title: string;
  message: string;
  quote?: string;
  time: string;
}

export enum NotificationTypeEnum {
  newOrder = '[New Order Notification]',
  newMessage = '[New Message Notification]',
  newRegistration = '[New Registration Notification]',
  newProductReview = '[New Product Review Notification]'
}


export interface NotificationAdmin {
  type: string;
  notificationId: string;
  notificationItemId: string; // userId, messageId, orderId
  photoUrl: string | null;
  textLead: string;
  textSub: string;
  createdOn: string;
  isViewed: boolean;
}


@Component({
  selector: 'yex-notification',
  standalone: true,
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgFor,



  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {

  notificationType = NotificationTypeEnum;
  // notifications: NotificationAdmin[];

  notifications: NotificationAdmin[] = [
 /*   {
      type: this.notificationType.newRegistration,
      notificationId: 'sdfasdf',
      notificationItemId: 'xcxfsdfwe', // userId, messageId, orderId
      photoUrl: 'https://lh3.googleusercontent.com/a-/AOh14GhdfBjHm6b5ARbqLW7cITXo51--VgCjC_FhV0nm',
      textLead: 'New customer Musa Jahun just registered, Anne Richard: accepted your invitation to join Notion',
      textSub: ' 7 hours ago',
      createdOn: new Date().toString(),
      isViewed: false
    },
    {
      type: this.notificationType.newOrder,
      notificationId: 'sdfasdf',
      notificationItemId: 'xcxfsdfwe', // userId, messageId, orderId
      photoUrl: 'https://lh3.googleusercontent.com/a-/AOh14GhdfBjHm6b5ARbqLW7cITXo51--VgCjC_FhV0nm',
      textLead: 'New order from',
      textSub: 'Musa Jahun order totals $200',
      createdOn: new Date().toString(),
      isViewed: true
    },
    {
      type: this.notificationType.newMessage,
      notificationId: 'sdfasdf',
      notificationItemId: 'xcxfsdfwe', // userId, messageId, orderId
      photoUrl: null,
      textLead: 'New message received',
      textSub: 'Sent by Musa Jahun',
      createdOn: new Date().toString(),
      isViewed: true
    }*/];
  notificationCount = 0;


  constructor() {


  }

  ngOnInit(): void {

  }


  private setHaveViewedNotification() {

  }

  ngOnDestroy(): void {

  }
}
