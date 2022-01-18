import React, {FC, useState, useEffect} from 'react';

import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {
  CustButton,
  Header,
  StatusBar,
  Footer,
  CustIcon,
} from '../../components';
import {commonStyles, Colors, boxModelSize} from '../../styles';
import {inject, observer} from 'mobx-react';
import {useTranslation} from 'react-i18next';

type profileProps = {
  profileStore: any;
};

const birhdayDate: FC<profileProps> = (props) => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const isEventPage = props.profileStore.profile.basicProfileFlag === 'Event';
  const [openInfo, setOpenInfo] = useState(false);
  const {t} = useTranslation();

  const goToNext = () => navigation.navigate('YourAddress');

  const onSubmit = () => {
    const basicProfileFlag = props.profileStore.profile?.basicProfileFlag;
    let timeDiff = Math.abs(Date.now() - date.getTime());
    let age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);

    props.profileStore.updateProfileData(
      {
        age,
        birthdayDate: date,
        basicProfileFlag:
          basicProfileFlag === 'Event' ? 'Event' : 'YourAddress',
      },
      goToNext,
    );
  };

  useEffect(() => {
    setPreviousFirestoreData(props.profileStore.profile);
  }, [props.profileStore.profile]);

  const setPreviousFirestoreData = (profileObj: any) => {
    profileObj.birthdayDate
      ? setDate(
          typeof profileObj.birthdayDate.seconds === 'number'
            ? new Date(profileObj.birthdayDate.seconds * 1000)
            : profileObj.birthdayDate,
        )
      : setDate(new Date());
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.headerArea}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <Header
          width={4 / 9}
          skipTo="YourAddress"
          title={t('profile:common:label:basic_information') + ' 4/9'}
          goBack="Gender"
          showSkip={isEventPage}
        />
      </View>
      <View style={commonStyles.contentArea}>
        <View style={commonStyles.profileTitleHolder}>
          <Text style={commonStyles.profileTitle}>
            {t('profile:birthdayDate:label:heading')}
          </Text>
          {isEventPage && (
            <TouchableOpacity
              style={commonStyles.titleInfo}
              onPress={() => setOpenInfo(true)}>
              <CustIcon
                type="material"
                name={'info'}
                color="#585858"
                size={boxModelSize.xxl}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={commonStyles.innerContainerArea}>
          <View style={commonStyles.alignItemsCenter}>
            <DatePicker
              mode="date"
              date={date}
              maximumDate={new Date()}
              onDateChange={setDate}
              textColor={Colors.red}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: Dimensions.get('window').width,
              }}
            />
          </View>
        </View>
      </View>
      <View style={commonStyles.footerArea}>
        <View style={commonStyles.buttonContainer}>
          <CustButton
            title={t('profile:common:label:next')}
            onPress={onSubmit}
          />
        </View>
        <Footer open={openInfo} onClose={() => setOpenInfo(false)} />
      </View>
    </SafeAreaView>
  );
};

export default inject('profileStore')(observer(birhdayDate));
