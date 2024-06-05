<script setup>

import { parseISO, format } from 'date-fns';

import useTransforms from '@/composables/useTransforms';
const { nth, phoneNumber, titleCase } = useTransforms();

import { useVotingStore } from '@/stores/VotingStore';
import { onMounted, computed } from 'vue';
const VotingStore = useVotingStore();

import VerticalTable from '@/components/VerticalTable.vue';

const electedOfficials = computed(() => {
  if (VotingStore.electedOfficials.rows && VotingStore.electedOfficials.rows.length) {
    return VotingStore.electedOfficials.rows;
  }
});

const council = computed(() => {
  console.log('electedOfficials.value:', electedOfficials.value);
  if (electedOfficials.value && electedOfficials.value) {
    return electedOfficials.value.filter((item) => {
      return item.office_label == "City Council";
    });
  }
});

const ballotFileId = computed(() => {
  if (electedOfficials.value) {
    return electedOfficials.value[0].ballot_file_id;
  }
});

const councilMember = computed(() => {
  if (council.value && council.value[0]) {
    return '<a href="http://' + council.value[0].website + '" target="_blank">' +
      council.value[0].first_name +" " +council.value[0].last_name + " - " + nth(council.value[0].district) + " Council District </a>";
  }
});

const office = computed(() => {
  if (council.value && council.value[0]) {
    return council.value[0].main_contact_address_2 + '<br>' +
      phoneNumber(council.value[0].main_contact_phone_1) + ", " + phoneNumber(council.value[0].main_contact_phone_2) + '<br>\
      F: '+ phoneNumber(council.value[0].main_contact_fax) + ' <br>\
      <b><a href=mailto:"' + council.value[0].email + '">' + council[0].email + '</a></b>';
  }
});

const term = computed(() => {
  if (council.value && council.value[0]) {
    return council.value[0].next_election - 4 + ' - ' + council.value[0].next_election;
  }
});

const pollingPlaceData = computed(() => {
  if (VotingStore.pollingPlaces.rows && VotingStore.pollingPlaces.rows.length) {
    return [
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
  }
});

const electedRepsData = computed(() => [
  {
    label: 'District Council Member',
    value: councilMember.value,
  },
  {
    label: 'City Hall Office',
    value: office.value,
  },
  {
    label: 'Current Term',
    value: term.value,
  }
]);

const nextElectionDate = computed(() => {
  if (VotingStore.nextElection.election_count_down_settings) {
    return format(parseISO(VotingStore.nextElection.election_count_down_settings.election_day), 'MMMM d, yyyy');
  }
});

</script>

<template>
  <section>
    <div class="columns is-multiline column is-8 is-offset-2 has-text-centered badge">
      <div class="column is-12 badge-title"><b>Next Eligible Election Is</b></div>
      <div class="column is-12 election">{{ nextElectionDate }}</div>
    </div>
  </section>
  <div class="mt-3 mb-3 has-text-centered">
    <a target="_blank" :href="ballotFileId">Preview ballot <font-awesome-icon icon="fa-solid fa-external-link-alt"></font-awesome-icon></a>
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
  border-width: 1px;
  border-style: solid;
  border-color: white;
  background-color: rgb(68, 68, 68);
}

.election {
  font-size: 2rem;
  background-color: #f0f0f0;
  border-width: 1px;
  border-style: solid;
  border-color: white;
}

</style>