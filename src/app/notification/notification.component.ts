import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../shared/notification.service";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.css"]
})
export class NotificationComponent implements OnInit {
  type: string = null;
  message: string = null;
  duration = 3000;

  constructor(notifier: NotificationService) {
    notifier.emmitter.subscribe(
      data => {
        this.type = data.type;
        this.message = data.message;
        this.duration = data.duration;
        this.reset( this.duration );
      }
    );
  }

  reset( duration ) {
    setTimeout( () => {
      this.type = null;
      this.message = null;
    }, this.duration );
  }

  ngOnInit() {
  }

}
