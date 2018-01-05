import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";

@Injectable()
export class NotificationService {
  private sub = new Subject<any> ();

  public emmitter = this.sub.asObservable();

  display (type, message, duration) {
    this.sub.next({type, message, duration});
  }
}
