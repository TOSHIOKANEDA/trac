import { Controller } from "@hotwired/stimulus"
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction';


export default class extends Controller {
  connect() {
    this.renderCalendar();
    document.addEventListener('refresh-calendar', () => {
      this.calendar.refetchEvents();
    });
  }

  renderCalendar() {
    this.calendar = new Calendar(this.element, {
      plugins: [dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'multiMonthYear,dayGridMonth,timeGridWeek'
      },
      initialView: 'dayGridMonth',
      locale: 'ja',
      buttonText: {
          today: '今日',
          month: '月',
          week: '週',
          day: '日',
          multiMonthYear: '年'
      },
      navLinks: true,
      editable: true,
      dayMaxEvents: true,
      events: '/events.json',
      eventContent: function(arg) {
        return { html: `<div class="p-1">${arg.event.title}</div>` };
      },
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          const frame = document.getElementById('modal');
          frame.src = info.event.url;
        }
      },
      eventDrop: (info) => {
        this.updateEvent(info.event);
      },
      eventResize: (info) => {
        this.updateEvent(info.event);
      }
    });
    this.calendar.render();
  }

  updateEvent(event) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    let formData = new URLSearchParams();
    formData.append('event[start_time]', event.start.toISOString());
    if (event.end) {
      formData.append('event[end_time]', event.end.toISOString());
    }

    fetch(`/events/${event.id}`, {
      method: 'PATCH',
      headers: {
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        console.error("Event update failed");
        info.revert();
      }
    });
  }
}