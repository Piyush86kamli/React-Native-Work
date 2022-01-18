import React, {FC, useEffect, useState} from 'react';
import {Text, View, StyleSheet, SafeAreaView} from 'react-native';
import {
  StatusBar,
  EventHeader,
  PhoneTextInput,
  Dropdown,
  CustButton,
  CustSnackBar,
  CustAuthInput,
  SelectContactModal,
  Footer,
  DismissKeyboard,
} from '../../components';
import {
  boxModelSize,
  Colors,
  commonStyles,
  Fonts,
  fontSize,
} from '../../styles';
import PhoneInput from 'react-native-phone-number-input';
import {useNavigation} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import {inject, observer} from 'mobx-react';
import Constants from '../../core/constants';
import friendsAndFamily from '../../model/friendsAndFamily.json';

interface FriendsAndFamilyProps {
  route: any;
  friendsAndFamilyStore: any;
  profileStore: any;
}

const data = friendsAndFamily.friendsAndFamily;

const FriendsAndFamily: FC<FriendsAndFamilyProps> = (props) => {
  const navigation = useNavigation();
  const [phoneNo, setPhoneNo] = useState<string>(undefined);
  const [phoneNoValid, setPhoneNoValid] = useState<boolean>(false);
  const [relationValue, setRelationValue] = useState('');
  const [enteredName, setEnteredName] = useState<string>('');
  const [valid, setValid] = useState(false);
  const [isFriendAndFamily, setIsFriendAndFamily] = useState(
    Constants.KEY_FAMILY,
  );
  const phoneInput = React.useRef<PhoneInput>(null);
  const [showSelectContact, setShowSelectContact] = useState(false);
  const [editItemObj, setEditItemObj] = useState(undefined);

  useEffect(() => {
    if (props.route.params.item) {
      setIsFriendAndFamily(props.route.params.item);
    }
    if (props.route.params.edititem) {
      setEditItemObj(props.route.params.edititem);
    }
  }, [props.route.params]);

  useEffect(() => {
    if (editItemObj) {
      setEnteredName(editItemObj.fullName);
      if (editItemObj.relationType != Constants.KEY_FRIENDS) {
        setRelationValue(editItemObj.relationType);
      }
      setPhoneNo(editItemObj.phoneNo);
    }
  }, [editItemObj]);

  const phoneNoChangeText = (text: string) => {
    setPhoneNo(text);
    setPhoneNoValid(false);
  };

  const goToNext = () => navigation.navigate('FamilyMember');

  const onSubmit = () => {
    var callingCode = '+' + phoneInput.current.getCallingCode();
    var onlyPhoneNo = phoneNo && phoneNo.replace(callingCode, '');
    var countryCode = phoneInput.current.getCountryCode();

    if (!phoneInput.current?.isValidNumber(phoneNo)) {
      setPhoneNoValid(true);
    } else if (
      props.friendsAndFamilyStore.checkIsFriendAndFamilyExist(
        isFriendAndFamily,
        onlyPhoneNo,
        editItemObj,
      )
    ) {
      CustSnackBar('Number already exist');
    } else if (enteredName) {
      setPhoneNoValid(false);
      if (relationValue != '' || isFriendAndFamily == Constants.KEY_FRIENDS) {
        var userID = props.profileStore.profile.userID;
        if (editItemObj) {
          props.friendsAndFamilyStore.editFriendAndFamily(
            {
              userID: userID,
              phoneCountryCode: callingCode,
              countryCodeString: countryCode,
              phoneNo: onlyPhoneNo,
              fullName: enteredName,
              relationType:
                isFriendAndFamily == Constants.KEY_FRIENDS
                  ? 'Friend'
                  : relationValue,
            },
            editItemObj.id,
            goToNext(),
          );
        } else {
          props.friendsAndFamilyStore.addFriendAndFamily(
            {
              userID: userID,
              phoneCountryCode: callingCode,
              countryCodeString: countryCode,
              phoneNo: onlyPhoneNo,
              fullName: enteredName,
              relationType:
                isFriendAndFamily == Constants.KEY_FRIENDS
                  ? 'Friend'
                  : relationValue,
            },
            goToNext(),
          );
        }
      } else {
        CustSnackBar('Please select relationship');
      }
    } else {
      setValid(true);
    }
  };

  const onChangeTextName = (text: string) => {
    setEnteredName(text);
    setValid(false);
  };

  const onShowContactList = () => {
    setShowSelectContact(true);
  };

  const onCloseSelectCOntact = () => {
    setShowSelectContact(false);
  };

  const onContactSelected = (contactData: any) => {
    if (contactData) {
      if (contactData.name) {
        setEnteredName(contactData.name);
      }
      if (contactData.number) {
        setPhoneNo(contactData.number);
      }
    }
    setShowSelectContact(false);
  };

  return (
    <SafeAreaView
      style={[commonStyles.safeArea, {backgroundColor: Colors.wildWatermelon}]}>
      <DismissKeyboard>
        <View style={commonStyles.eventContainer}>
          <StatusBar
            backgroundColor={Colors.wildWatermelon}
            barStyle="dark-content"
          />
          <EventHeader
            title={
              isFriendAndFamily == Constants.KEY_FRIENDS
                ? 'Enter Friend Details'
                : 'Enter Family Details'
            }
            goBack="FamilyMember"
          />
          <View style={style.container}>
            {showSelectContact && (
              <SelectContactModal
                onConfirm={onContactSelected}
                onClose={onCloseSelectCOntact}
              />
            )}

            <View>
              <View>
                <View>
                  <Text style={style.footerText}>Enter Number</Text>
                  <PhoneTextInput
                    defaultCode={
                      props.route.params.edititem &&
                      props.route.params.edititem.countryCodeString
                        ? props.route.params.edititem.countryCodeString
                        : ''
                    }
                    referenceId={phoneInput}
                    defaultValue={
                      phoneNo
                        ? phoneNo
                        : props.route.params.edititem &&
                          props.route.params.edititem.phoneNo
                        ? props.route.params.edititem.phoneNo
                        : phoneNo
                    }
                    onChangeFormattedText={phoneNoChangeText}
                    valid={phoneNoValid}
                  />
                  <View style={{height: boxModelSize.xl}}>
                    {phoneNoValid && (
                      <Animatable.Text
                        animation="shake"
                        style={commonStyles.defaultErrorText}>
                        Phone number not provided
                      </Animatable.Text>
                    )}
                  </View>
                </View>

                {/* {isFriendAndFamily != Constants.KEY_FRIENDS && (
                <Pressable onPress={onShowContactList}>
                  <CustIcon
                    type="antdesign"
                    name="contacts"
                    color={Colors.black}
                    size={25}
                  />
                </Pressable>
              )} */}
              </View>
              <View style={{marginVertical: boxModelSize.xxl}}>
                <Text style={style.footerText}>Enter Name</Text>
                <CustAuthInput
                  multiline={false}
                  placeholder="e.g. Jone"
                  onChangeText={onChangeTextName}
                  value={enteredName}
                />
                {valid && (
                  <Animatable.Text
                    animation="shake"
                    style={commonStyles.defaultErrorText}>
                    No name provided
                  </Animatable.Text>
                )}
              </View>
              {isFriendAndFamily == Constants.KEY_FAMILY ? (
                <View>
                  <Text style={style.logoSubTitle}>Relationship with you</Text>
                  <View style={style.modalContainer}>
                    <View>
                      {/* <View
                        style={{
                          position: 'absolute',
                          top: boxModelSize.s,
                          left: boxModelSize.m,
                        }}>
                        <Text style={style.titleBox}>Choose from list</Text>
                      </View> */}
                      <Dropdown
                        textInput
                        icon={false}
                        data={data}
                        onChange={(option) => {
                          setRelationValue(option.label);
                        }}
                        placeholder="Please choose from the list"
                        value={relationValue}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{marginVertical: boxModelSize.eighty}}></View>
              )}
              <CustButton title={'Submit'} onPress={onSubmit} />
              {/* <View style={{marginVertical: verticalScale(20)}}>
            <CustButton title={'Create Profile '} onPress={onCreateProfile} />
          </View> */}
            </View>
          </View>
        </View>
        <Footer onlyButtons={true} />
      </DismissKeyboard>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    marginTop: boxModelSize.xl,
    marginHorizontal: boxModelSize.xl,
  },
  footerText: {
    fontFamily: Fonts.primaryRegular,
    color: Colors.suvaGrey,
    fontSize: fontSize.h6,
  },
  logoSubTitle: {
    fontFamily: Fonts.primarySemiBold,
    color: Colors.black,
    fontSize: fontSize.h4,
    textAlign: 'center',
    marginVertical: boxModelSize.l,
  },
  modalContainer: {
    height: '35%',
    width: '100%',
    borderColor: Colors.borderGrey,
    borderRadius: boxModelSize.s,
    borderWidth: 1,
    justifyContent: 'center',
  },
  titleBox: {
    fontFamily: Fonts.primarySemiBold,
    color: Colors.noTicketFont,
    fontSize: fontSize.h4,
  },
});

export default inject(
  'profileStore',
  'friendsAndFamilyStore',
)(observer(FriendsAndFamily));
