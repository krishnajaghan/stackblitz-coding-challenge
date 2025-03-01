import { Component, OnDestroy, OnInit } from '@angular/core';
import { TramService } from './data.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

//comments has been added in each method & its declarations
export class AppComponent implements OnInit, OnDestroy {
  departures: any[] = [];
  loading = true;
  error = '';
  timeDownCounter: any;

  constructor(private tramService: TramService) {}

  ngOnInit() {
    this.fetchTramDepartures();
    // user can see exactly how much time left before the tram leaves
    this.countdownTimer(); 
   }
  
  fetchTramDepartures() {
    //show loader in the beginning
    this.loading = true; 
  
    this.tramService.getTramDepartures().subscribe({
      next: (resp: any) => {
        if (resp?.departures?.length) {
          // get the response in this.departures
          this.departures = resp.departures

          //filter check tram is departing from Luma and its destination is Linde
            .filter((departure: any) => departure.stop_area?.name === 'Luma' 
            && departure.destination === 'Linde')
            //mapping here in such a way that in html we can access the variable easily
            .map((departure: any) => ({  
              destination: departure.destination,
              direction: departure.direction,
              scheduled: departure.scheduled ? new Date(departure.scheduled) : null,
              expected: departure.expected ? new Date(departure.expected) : null,
              state: departure.state,

              //additional requirement to show the contdown timer
              //shows the remaining time until a tram departs.
              countdown: this.getCountdown(departure.expected),   
                }));
        } else {
          //reset this.departures if there is no value ( failure case check)
          this.departures = [];  
        }
        //lodaer has to be hidden
        this.loading = false; 
      },
      error: (e: any) => {
        console.error('Error:', e);
        this.error = 'Failed to load tram departures, try again later.';
        //reset this.departures if there is no value ( failure case check) && make loader false
        this.departures = [];  
        this.loading = false;
      }
    });
  }

  // user can see exactly how much time left before the tram leaves
  countdownTimer() {
    this.timeDownCounter = setInterval(() => {
      this.departures.forEach(departure => {
        departure.countdown = this.getCountdown(departure.expected);
      });
    }, 1000);
  }

  //date and time conversions
  //example: it shows Tram departs in 10m 45s or Tram Departed
  getCountdown(value: Date | null): string {
    if (!value) return 'null';  
    const timeDifference = value.getTime() - Date.now();
    const minutes = Math.floor(timeDifference / (60 * 1000)); 
    const seconds = Math.floor((timeDifference % (60 * 1000)) / 1000); 
    return timeDifference <= 0 ? 'Tram Departed' : `Tram departs in ${minutes}m ${seconds}s`;
  }

  ngOnDestroy() {
    clearInterval(this.timeDownCounter); 
  }
  
}
