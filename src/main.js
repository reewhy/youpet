import {createApp} from "vue";
import App from "./App.vue";
import Notifications from "@kyvg/vue3-notification";
import './style.css'

const app = createApp(App);

app.use(Notifications);


app.config.errorHandler = (err, instance, info) => {
    console.log("Global error:", err);
    console.log("Vue instance:", instance);
    console.log("Error info:", info);

};

app.mount("#app");