<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
          flat
        >

          <v-btn
            class="mr-4"
            color="red darken-2"
            @click="dialog = true"
            dark
          >
            New
          </v-btn>
          <v-btn
            outlined
            class="mr-4"
            color="grey darken-2"
            @click="setToday"
          >
            Today
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu
            bottom
            right
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <!-- termin hinzufügen -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-main>
            <v-form @submit.prevent="addEvent">
              <v-text-field v-model="name" type="text" label="Name"></v-text-field>
              <v-text-field v-model="ort" type="text" label="Ort(Gym oder Platz)"></v-text-field>
              <v-text-field v-model="start" type="date" label="Startdatum"></v-text-field>
              <v-text-field v-model="ende" type="date" label="Enddatum"></v-text-field>
              <v-btn type="submit" color="#D32F2F" class="mr-4" @click.stop="dialog=false">
                Termin buchen
              </v-btn>
            </v-form>
          </v-main>
        </v-card>
      </v-dialog>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="red"
          :events="events"
          
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn @click="deleteEvent(selectedEvent.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
             <!--  <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn> -->
              <!-- <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn> -->
            </v-toolbar>
            <v-card-text>
              <!-- wenn nicht editiert wird -->
              <form v-if="currentlyEditing !== selectedEvent.id">
                {{selectedEvent.ort}}
              </form>
              <!-- wenn editiert wird -->
              <form v-else>
                <textarea-autosize
                  v-model="selectedEvent.ort"
                  type="text"
                  style="width: 100%"
                  placeholder="Ort:">
                </textarea-autosize>
              </form>
              
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false">Close
              </v-btn>
              <v-btn
                text
                v-if="currentlyEditing !== selectedEvent.id" @click.prevent="editEvent(selectedEvent)">Edit
              </v-btn>
              <v-btn
                text
                v-else @click.prevent="updateEvent(selectedEvent)">Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { db } from '@/main';
export default {
    data: () => ({
        /* in today soll beim button klick das datum(ohne zeit) angegeben werden */
        today: new Date().toISOString()/* .substr(0,10), */,
        focus: new Date().toISOString()/* .substr(0,10), */,
        type: 'month',
        typeToLabel: {
            month: 'Month',
            week: 'Week',
            day: 'Day',
            '4day': '4 Days',
        },
        /* meine Firebase Felder */
        name: null, 
        ort: null,
        start: null, 
        ende: null, 
        color: 'red',
        /* hier kommt meine id rein */
        currentlyEditing: null,
        selectedEvent: {},
        selectedElement: null,
        /* wenn das modal offen ist */
        selectedOpen: false,
        /* kommen von firebase */
        events: [],
        dialog: false
    }),
    mounted() {
        this.getEvents();
    },
    methods: {
      /* firebase */
        async getEvents(){
            let snapshot = await db.collection('termine').get();
            /* über den snapshot loopen und jedes dokument erhalten. */
            /* dokument in event pushen */
            let events = [];
            /* da einfach nur doc mir zwar alles mögliche zurückgibt, aber ich die data-funktion brauche, um die daten zu sehen 
                - die id wird mir in data aber nicht gegeben */
            snapshot.forEach(doc => {
                let appData = doc.data();
                console.log(doc.data());
                appData.id = doc.id;
                events.push(appData);
            });
              this.events = events;
         },
         async addEvent(){
           /* wenn die felder nicht leer sind zur Datenbank hinzufügen*/
           if(this.name && this.start && this.ende){
             await db.collection('termine').add({
               name: this.name,
               ort: this.ort,
               start: this.start,
               ende: this.ende
             });
             this.getEvents();
             this.name = "";
             this.ort = "";
             this.start = "";
             this.ende = "";
           }else {
             alert('Name, Startdatum und Enddatum sind MUSS-Felder!');
           }
         },
         async updateEvent(event){
           await db.collection('termine').doc(this.currentlyEditing).update({
             ort: event.ort
           });
           this.selectedOpen = false; 
           this.currentlyEditing = null;
         },
         async deleteEvent(event) {
           await db.collection('termine').doc(event).delete();
            this.selectedOpen = false;
            this.getEvents();
         },
          viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      /* getEventColor (event) {
        return event.color
      }, */
      setToday () {
        this.focus = ''
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      editEvent(event){
        this.currentlyEditing = event.id
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          requestAnimationFrame(() => requestAnimationFrame(() => open()))
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange ({ start, end }) {
        const events = []

        const min = new Date(`${start.date}T00:00:00`)
        const max = new Date(`${end.date}T23:59:59`)
        const days = (max.getTime() - min.getTime()) / 86400000
        const eventCount = this.rnd(days, days + 20)

        for (let i = 0; i < eventCount; i++) {
          const allDay = this.rnd(0, 3) === 0
          const firstTimestamp = this.rnd(min.getTime(), max.getTime())
          const first = new Date(firstTimestamp - (firstTimestamp % 900000))
          const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000
          const second = new Date(first.getTime() + secondTimestamp)

          events.push({
            name: this.names[this.rnd(0, this.names.length - 1)],
            start: first,
            end: second,
            color: this.colors[this.rnd(0, this.colors.length - 1)],
            timed: !allDay,
          })
        }

        this.events = events
      },
      rnd (a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a
      },
    }
}
</script>>