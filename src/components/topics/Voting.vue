<script setup>

import { parseISO, format } from 'date-fns';

import useTransforms from '@/composables/useTransforms';
const { nth, phoneNumber, titleCase } = useTransforms();

import { useVotingStore } from '@/stores/VotingStore';
import { onMounted } from 'vue';
const VotingStore = useVotingStore();

import VerticalTable from '@/components/VerticalTable.vue';

const council = VotingStore.electedOfficials.rows.filter((item) => {
  return item.office_label == "City Council";
});

const getCouncilMember = () => {
  return '<a href="http://' + council[0].website + '" target="_blank">' +
    council[0].first_name +" " +council[0].last_name + " - " + nth(council[0].district) + " Council District </a>";
};

const getOffice = () => {
  return council[0].main_contact_address_2 + '<br>' +
    phoneNumber(council[0].main_contact_phone_1) + ", " + phoneNumber(council[0].main_contact_phone_2) + '<br>\
    F: '+ phoneNumber(council[0].main_contact_fax) + ' <br>\
    <b><a href=mailto:"' + council[0].email + '">' + council[0].email + '</a></b>';
}

const getTerm = () => {
  return council[0].next_election - 4 + ' - ' + council[0].next_election;
}

onMounted(() => {
  const topic = document.getElementById('Property-topic');
  topic.scrollIntoView();
  const main = document.getElementById('main');
  const mainScrollTop = main.scrollTop;
  main.scrollTo(0, mainScrollTop - 80);
});

const pollingPlaceData = [
  {
    label: 'Location',
    value: '<b>Ward ' + VotingStore.pollingPlaces.rows[0].ward + ', Division ' + VotingStore.pollingPlaces.rows[0].division + '</b><br>' +
        titleCase(VotingStore.pollingPlaces.rows[0].placename) + '<br>' +
        titleCase(VotingStore.pollingPlaces.rows[0].street_address)
  },
  {
    label: 'Hours',
    value: 'All polling places will be open on election day from 7 a.m. to 8 p.m.'
  },
  {
    label: 'Accessibility',
    value: ''
  },
  {
    label: 'Parking',
    value: ''
  },
];

const electedRepsData = [
  {
    label: 'District Council Member',
    value: getCouncilMember()
  },
  {
    label: 'City Hall Office',
    value: getOffice()
  },
  {
    label: 'Current Term',
    value: getTerm()
  }
];

</script>

<template>
  <section>
    <div class="columns is-multiline column is-8 is-offset-2 has-text-centered badge">
      <div class="column is-12 mb-1 badge-title"><b>Next Eligible Election Is</b></div>
      <div class="column is-12 election">{{ format(parseISO(VotingStore.nextElection.election_count_down_settings.election_day), 'MMMM d, yyyy') }}</div>
    </div>
  </section>
  <div class="mt-3 mb-3 has-text-centered">
    <a target="_blank" :href="VotingStore.electedOfficials.rows[0].ballot_file_id">Preview ballot <font-awesome-icon icon="fa-solid fa-external-link-alt"></font-awesome-icon></a>
  </div>

  <div id="Voting-description" class="box">The deadline to register for the next election is 15 days prior to the election. You can confirm your registration and learn about registering to vote at <a target="_blank" href="vote.phila.gov">vote.phila.gov</a>.</div>

  <h5 class="subtitle is-5 table-title">Polling Place</h5>
  <vertical-table :table-id="'pollingPlaceTable'" :data="pollingPlaceData" />
  <br>

  <h5 class="subtitle is-5 table-title">Elected Representatives</h5>
  <vertical-table :table-id="'electedRepsTable'" :data="electedRepsData" />
  <br>

</template>

<style scoped>

.badge-title {
  padding-top: 0.25rem !important;
  height: 2rem;
  color: white;
  background-color: #2176d2;
}

.election {
  font-size: 2rem;
  background-color: #f0f0f0;
}

</style>