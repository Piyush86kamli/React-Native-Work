import {action, makeAutoObservable} from 'mobx';
import {
  fetchCovidDataService,
  updateCovidDataService,
} from '../../services/covidInfo';
import stores from '../../mobx';
import moment from 'moment';

export default class CovidStore {
  constructor() {
    makeAutoObservable(this);
  }

  loading: boolean = false;
  covidData: any = undefined;
  isCovidScreen: boolean = false;
  covidDataFetched: boolean = false;

  setCovidSelectedData = (data: any, callback: any) => {
    this.loading = true;

    updateCovidDataService(data).then(
      action((response: any) => {
        if (response == 'SUCCESS') {
          this.isCovidScreen = false;
          this.covidData = {...data};
          callback ? callback() : null;
        }
        this.loading = false;
      }),
    );
  };

  fetchCovidData = () => {
    this.loading = true;
    this.covidDataFetched = false;

    const userID = stores.profileStore.profile.userID;
    const eventID = stores.eventStore.currentEvent.eventID;

    fetchCovidDataService(userID, eventID)
      .then(
        action((response: any) => {
          this.covidDataFetched = true;

          if (response && response.length > 0) {
            let sortedData = response.sort((aObj: any, bObj: any) => {
              var aDate = moment(new Date(aObj.createdAt.toDate())).format(
                'YYYY-MM-DD',
              );
              var bDate = moment(new Date(bObj.createdAt.toDate())).format(
                'YYYY-MM-DD',
              );

              return Date.parse(bDate) - Date.parse(aDate);
            });

            this.covidData = sortedData[0];
          } else {
            this.covidData = undefined;
            this.isCovidScreen = true;
          }
          this.loading = false;
        }),
      )
      .catch(() => {
        this.loading = false;
      });
  };

  setCovidScreen = (value: boolean) => {
    this.isCovidScreen = value;
  };

  reset = () => {
    //console.log();
  };
}
