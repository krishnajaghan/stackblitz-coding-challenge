import { Component, OnDestroy, OnInit } from '@angular/core';
import { TramService } from './data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

//comments has been added in each method & its declarations
export class AppComponent implements OnInit, OnDestroy {
  departures: any[] = [];
  loading = true;
  error = '';
  timeDownCounter: any;
  sortKey: string = 'scheduled';
  sortOrder: 'asc' | 'desc' = 'asc';
  isDarkMode: boolean = false;
  columns = [
    { key: 'destination', label: 'Destination' },
    { key: 'direction', label: 'Direction' },
    { key: 'scheduled', label: 'Scheduled Time' },
    { key: 'expected', label: 'Expected Time' },
    { key: 'state', label: 'State' },
    { key: 'statusHighlight', label: 'Status Highlight' },
    { key: 'countdown', label: 'Countdown' },
  ];
  // faSun = faSun;
  // faMoon = faMoon;
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
            .filter(
              (departure: any) =>
                departure.stop_area?.name === 'Luma' &&
                !departure.direction?.toLowerCase().includes('sickla') &&
                !departure.destination?.toLowerCase().includes('sickla')
            )
            //mapping here in such a way that in html we can access the props for each table properties
            .map((departure: any) => {
              const scheduledTime = departure.scheduled
                ? new Date(departure.scheduled.toLocaleString())
                : null;
              const expectedTime = departure.expected
                ? new Date(departure.expected.toLocaleString())
                : scheduledTime;

              return {
                destination: departure.destination,
                direction: departure.direction,
                scheduled: scheduledTime ? this.formatDate(scheduledTime) : 'N/A', 
                expected: expectedTime ? this.formatDate(expectedTime) : 'N/A', 
                state: departure.state,
                statusHighlight: this.getStatusHighlight(
                  departure.state,
                  scheduledTime,
                  expectedTime
                ),
                //additional requirement to show the contdown timer
                //shows the remaining time until a tram departs.
                countdown: expectedTime
                  ? this.getCountdown(expectedTime)
                  : null,
              };
            });
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
      },
    });
  }

  // user can see exactly how much time left before the tram leaves
  countdownTimer() {
    this.timeDownCounter = setInterval(() => {
      this.departures.forEach((departure) => {
        departure.countdown = this.getCountdown(departure.expected);
      });
    }, 1000);
  }
  sortTable(column: string) {
    if (this.sortKey === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = column;
      this.sortOrder = 'asc';
    }

    this.departures.sort((a: any, b: any) => {
      let valueA = a[column];
      let valueB = b[column];

      if (column === 'scheduled' || column === 'expected') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortClass(column: string): string {
    return this.sortKey === column
      ? this.sortOrder === 'asc'
        ? 'sorted-asc'
        : 'sorted-desc'
      : '';
  }

  getSortIcon(column: string): string {
    if (this.sortKey === column) {
      return this.sortOrder === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down';
    }
    return 'fa-sort';
  }
  getStatusHighlight(
    state: string,
    scheduledTime: Date | null,
    expectedTime: Date | null
  ): string {
    if (!scheduledTime || !expectedTime) {
      return 'no time is present';
    }
  
    if (state === 'delayed') {
      return 'Delayed';
    }
    if (state === 'cancelled') {
      return 'Cancelled';
    }
    if (expectedTime > scheduledTime) {
      return 'Delayed';
    }
    return 'On Time';
  }
  

  formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getStatusClass(state: string): string {
    return state === 'on-time'
      ? 'on-time'
      : state === 'delayed'
      ? 'delayed'
      : state === 'cancelled'
      ? 'cancelled'
      : '';
  }

  //date and time conversions
  //example: it shows Tram departs in 10m 45s or Tram Departed
  getCountdown(value: Date | null): string {
    if (!value) return 'null';

    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const timeDifference = date.getTime() - Date.now();

    let minutes = Math.floor(Math.abs(timeDifference) / (60 * 1000));
    let seconds = Math.floor((Math.abs(timeDifference) % (60 * 1000)) / 1000);

    // Trim minutes to two digits and remove any negative sign
    minutes = Number(String(minutes).slice(0, 2));

    return `Tram departs in ${minutes}m ${seconds}s`;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  ngOnDestroy() {
    clearInterval(this.timeDownCounter);
  }
}