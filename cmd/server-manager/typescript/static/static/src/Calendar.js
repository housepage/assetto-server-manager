"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@fullcalendar/core");
const timegrid_1 = __importDefault(require("@fullcalendar/timegrid"));
const list_1 = __importDefault(require("@fullcalendar/list"));
const bootstrap_1 = __importDefault(require("@fullcalendar/bootstrap"));
document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        return;
    }
    let calendar = new core_1.Calendar(calendarEl, {
        plugins: [timegrid_1.default, list_1.default, bootstrap_1.default],
        defaultView: 'timeGridThreeDay',
        events: '/calendar.json',
        themeSystem: 'bootstrap',
        header: {
            center: 'timeGridWeek,timeGridThreeDay,listWeek'
        },
        views: {
            timeGridThreeDay: {
                type: 'timeGrid',
                duration: { days: 3 },
                buttonText: '3 day'
            }
        },
        eventRender: function (info) {
            let $title = $(info.el).find('.fc-title');
            let $time = $(info.el).find('.fc-time');
            if (info.event.extendedProps.signUpURL) {
                $time.append('<a class="calendar-signup-link" href="' + info.event.extendedProps.signUpURL + '">Event Sign Up</a>');
            }
            $title.append('<div class="hr-line-solid-no-margin"></div><span class="calendar-small">' + info.event.extendedProps.description + '</span></div>');
            if (info.event.extendedProps.scheduledServerID) {
                $title.append('<div class="calendar-small">On <span class="scheduled-server-id" data-server-id="' + info.event.extendedProps.scheduledServerID + '">another server</span></div>');
            }
            let $listTitle = $(info.el).find('.fc-list-item-title');
            if (info.event.extendedProps.signUpURL) {
                $listTitle.append('</div><a class="calendar-signup-link" href="' + info.event.extendedProps.signUpURL + '">Event Sign Up</a>');
            }
            $listTitle.append('<div class="ml-2"></div><span class="calendar-small">' + info.event.extendedProps.description + '</span></div>');
            if (info.event.extendedProps.scheduledServerID) {
                $listTitle.append('<div class="calendar-small">On <span class="scheduled-server-id" data-server-id="' + info.event.extendedProps.scheduledServerID + '">another server</span></div>');
            }
        },
        nowIndicator: true,
        allDaySlot: false,
        timeGridEventMinHeight: 100,
        height: 800,
        contentHeight: 1000,
    });
    calendar.render();
});
//# sourceMappingURL=Calendar.js.map