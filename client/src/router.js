import { createRouter, createWebHistory } from 'vue-router';
import BmiView from './views/BmiView.vue';
import WorkoutView from './views/WorkoutView.vue';
import SummaryView from './views/SummaryView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'body', component: BmiView, meta: { label: 'Body Check' } },
    { path: '/training', name: 'training', component: WorkoutView, meta: { label: 'Training' } },
    { path: '/report', name: 'report', component: SummaryView, meta: { label: 'Report' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
