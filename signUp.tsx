import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {scale, verticalScale} from 'react-native-size-matters';
import * as Animatable from 'react-native-animatable';
import PhoneInput from 'react-native-phone-number-input';
import {
  doSignIn,
  doVerifiOTP,
  getUserDetails,
} from '../../services/authServices';
import {inject, observer} from 'mobx-react';
import {
  CustIcon,
  CustButton,
  StatusBar,
  PhoneTextInput,
  ProgressBar,
  DismissKeyboard,
} from '../../components';
import Constants from '../../core/constants';
import {
  boxModelSize,
  Colors,
  commonStyles,
  Fonts,
  fontSize,
} from '../../styles';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  AuthStackParamList,
  RootStackParamList,
} from '../../types/navigationsTypes';
import OTPInput from '../../components/otpInput';
import {openExternalURL} from '../../core/utils';
import {setDeviceToken} from '../../services/profileServices';
import {fcMessaging} from '../../services/fcMessaging';
import {getUniqueId} from 'react-native-device-info';
import ReactNativeBiometrics from 'react-native-biometrics';
import {getSessionDataObject, setSessionData} from '../../core/asyncStorage';
type signUpRouteProp = RouteProp<AuthStackParamList, 'Signup'>;
type SignUpNavigationProps = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'Signup'>,
  StackNavigationProp<RootStackParamList>
>;
type SignUpProps = {
  navigation: any;
  route: signUpRouteProp;
  i18n: any;
  profileStore: any;
};

const signUp: FC<SignUpProps> = (props) => {
  let index = 0;
  const language = [
    {key: (index += 1), lngCode: 'en', label: 'English'},
    {key: (index += 1), lngCode: 'hi', label: 'हिन्दी'},
    {key: (index += 1), lngCode: 'ar', label: 'عربى'},
    {key: (index += 1), lngCode: 'de', label: 'Dutch'},
  ];

  const [phoneNo, setPhoneNo] = useState<string>('');
  const [phoneNoValid, setPhoneNoValid] = useState<boolean>(false);
  const [boxValid, setBoxValid] = useState<boolean>(false);
  const [checkValue, setCheckValue] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [otpView, setOtpView] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmResult, setConfirmResult] = useState<any>({});
  const [error, setError] = useState<string>('');
  const {login} = props.route.params;

  const phoneInput = React.useRef<PhoneInput>(null);
  const {t} = useTranslation();
  const [supportFingerID, setSupportFingerID] = useState<boolean>(false);
  const [supportFaceID, setSupportFaceID] = useState<boolean>(false);
  const [bioMetricError, setBioMetricError] = useState<any>('');

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = props.navigation.addListener('focus', focusedHandler);

      return () => unsubscribe();
    }, [props.navigation]),
  );

  useEffect(() => {
    if (supportFingerID || supportFaceID) {
      getSessionDataObject('userObj')
        .then((response: any) => {
          if (response != null) {
            if (response.user.faceID && supportFaceID) {
              setSupportFaceID(true);
              doFingerPrint();
            } else if (
              bioMetricError == 'BIOMETRIC_ERROR_NONE_ENROLLED' &&
              response.user.faceID
            ) {
              Alert.alert(t('auth:alert:info:you_do_not_have_face_id'));
            }
            if (response.user.fingerID && supportFingerID) {
              setSupportFingerID(true);
              doFingerPrint();
            } else if (
              bioMetricError == 'BIOMETRIC_ERROR_NONE_ENROLLED' &&
              response.user.fingerID
            ) {
              Alert.alert(t('auth:alert:info:you_do_not_have_fingerprint'));
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [supportFingerID, supportFaceID]);

  const focusedHandler = () => {
    ReactNativeBiometrics.isSensorAvailable().then((resultObject) => {
      const {available, biometryType, error} = resultObject;
      if (available && biometryType === ReactNativeBiometrics.TouchID) {
        setSupportFingerID(true);
      } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
        setSupportFaceID(true);
      }
      if (available && biometryType === ReactNativeBiometrics.Biometrics) {
        setSupportFingerID(true);
      }
      if (!available && error) setBioMetricError(error);
    });
  };

  const doFingerPrint = () => {
    ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Confirm fingerprint',
    })
      .then((resultObject) => {
        const {success} = resultObject;
        if (success) {
          setSessionData('signedIn', 'in')
            .then(() => {
              setLoader(true);
              setTimeout(() => {
                setLoader(false);
                props.navigation.navigate('Init', {initialLogin: true});
              }, 2000);
            })
            .catch((error) => {
              console.log('not able to store session data.');
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signInHandler = () => {
    if (
      (phoneNo != '' && phoneInput.current?.isValidNumber(phoneNo)) ||
      otpView
    ) {
      setPhoneNoValid(false);
      if (checkValue || otpView) {
        setBoxValid(false);
        setLoader(true);
        doSignIn(phoneNo)
          .then((resopnse: any) => {
            if (resopnse) {
              setConfirmResult(resopnse);
              setOtpView(true);
              setLoader(false);
            }
          })
          .catch((e) => {
            setLoader(false);
            Alert.alert('Error', e);
          });
      } else {
        setBoxValid(true);
        setLoader(false);
      }
    } else {
      setPhoneNoValid(true);
    }
  };

  const otpValidateHandler = (value: string) => {
    setError('');

    if (value.length != 6) return;
    setLoader(true);
    doVerifiOTP(confirmResult, value)
      .then(() => {
        getUserDetails().then((user) => {
          let deviceID = getUniqueId();
          setDeviceToken({
            deviceToken: fcMessaging.deviceToken,
            fbUserID: user.uid,
            deviceID,
          }).then(() => {
            setSessionData('signedIn', 'in')
              .then(() => {
                setSuccess(true);
                setLoader(false);
                setTimeout(() => {
                  props.navigation.navigate('Init', {initialLogin: true});
                }, 2000);
              })
              .catch((error) => {
                console.log('not able to store session data.');
              });
          });
        });
      })
      .catch((error) => {
        setError(error);
        setLoader(false);
      });
  };

  const phoneNoChangeText = (text: string) => {
    setPhoneNo(text);
    setPhoneNoValid(false);
    var callingCode = '+' + phoneInput.current.getCallingCode();
    props.profileStore.setCountryCodeLength(callingCode.length);
  };

  const checkBoxHandler = () => {
    setCheckValue(!checkValue);
    setBoxValid(false);
  };

  const openTermsLink = () => {
    openExternalURL('https://www.gardian.tech/data-privacy-policy');
  };
  return (
    <View style={style.masterContainer}>
      <DismissKeyboard>
        {loader && <ProgressBar />}
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <View style={{flex: 1}}>
          <View style={style.backgroundTopBG}>
            <ImageBackground
              style={style.bgImage}
              source={Constants.AUTH_BG_IMAGE}
              imageStyle={commonStyles.imageOpacity}
            />
          </View>
          <View style={style.backgroundBottomBG}></View>
        </View>
        <View style={style.contentContainer}>
          <View style={style.topBGContainer}>
            <View style={style.backContainer}>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.goBack();
                }}>
                <Image style={style.bgImageContainer} source={Constants.BACK} />
              </TouchableOpacity>
              {/* <Dropdown
                data={language}
                onChange={async (option) => {
                  props.i18n.changeLanguage(option.lngCode);
                  await I18nManager.forceRTL(false);
                }}
                icon
              /> */}
            </View>
            <View style={style.loginText}>
              <Text style={style.logoTitle}>
                Welcome
                {/* {t('auth:login:label:sign_up')} */}
              </Text>
              {/* <Text style={style.logoTitleTwo}>
              {t('auth:login:info:let_us_create_account')}
            </Text> */}
            </View>
          </View>
          <View style={style.footerContainer}>
            {!otpView ? (
              <View style={{flex: 1}}>
                <View style={{flex: 0.8}}>
                  <Text
                    style={[
                      commonStyles.profileTitle,
                      {marginBottom: boxModelSize.m},
                    ]}>
                    {t('auth:login:info:verify_mobile_number')}
                  </Text>
                  <Text style={style.footerText}>
                    {t('auth:login:label:enter_number')}
                  </Text>
                  <PhoneTextInput
                    referenceId={phoneInput}
                    defaultValue={phoneNo}
                    onChangeFormattedText={phoneNoChangeText}
                    valid={phoneNoValid}
                    defaultCode="AU"
                  />
                  <Text style={style.countryText}>
                    {t('auth:login:info:with_country_code')}
                  </Text>
                  <View style={{height: boxModelSize.xxl}}>
                    {phoneNoValid && (
                      <Animatable.Text
                        animation="shake"
                        style={commonStyles.defaultErrorText}>
                        {phoneNo.length === 0
                          ? t('auth:login:error:number_not_provided')
                          : 'Phone number is invalid'}
                      </Animatable.Text>
                    )}
                  </View>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}>
                      <View style={[style.shadowContainerStyle, {flex: 0.1}]}>
                        <TouchableOpacity
                          style={[style.checkBox, {}]}
                          onPress={checkBoxHandler}>
                          {checkValue && (
                            <CustIcon
                              type="antdesign"
                              name="check"
                              color={Colors.black}
                              size={22}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          commonStyles.directionRow,
                          {
                            marginBottom: boxModelSize.l,
                            flex: 0.9,
                            paddingLeft: boxModelSize.l,
                          },
                        ]}>
                        {/* <Text style={style.footerText}>you agree the </Text> */}
                        <Text style={[style.footerText]}>
                          {t('auth:login:info:agreement')}
                          <Text
                            style={[style.footerText, style.termsLink]}
                            onPress={openTermsLink}>
                            {' Terms and Conditions'}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        height: boxModelSize.xl,
                      }}>
                      {boxValid && (
                        <Animatable.Text
                          animation="shake"
                          style={commonStyles.defaultErrorText}>
                          {t('auth:login:error:please_check')}
                        </Animatable.Text>
                      )}
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 0.2,
                    justifyContent: 'flex-end',
                  }}>
                  <CustButton
                    color={
                      phoneNo != '' &&
                      phoneInput.current.isValidNumber(phoneNo) &&
                      checkValue
                        ? Colors.eventRed
                        : Colors.grey
                    }
                    title={t('auth:login:label:continue')}
                    onPress={signInHandler}
                  />
                </View>
              </View>
            ) : !success ? (
              <OTPInput
                info={phoneNo}
                onResend={() => {}}
                onSubmit={otpValidateHandler}
                onClose={setOtpView.bind(this, false)}
                clearError={() => {}}
                error={t('auth:login:error:enter_valid_otp')}
                verifyOtpError={error}
              />
            ) : (
              <View style={style.loginSuccess}>
                <View style={{flex: 0.2}}>
                  <Text style={style.footerTitle}>Success!</Text>
                </View>
                <View style={{flex: 0.6}}>
                  <Image
                    source={Constants.SUCCESS}
                    style={style.imageSuccess}
                  />
                </View>
                <View
                  style={{flex: 0.2, width: '80%', justifyContent: 'flex-end'}}>
                  <Text style={[style.footerTitle, {textAlign: 'center'}]}>
                    Your number has been verified
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </DismissKeyboard>
    </View>
  );
};

const style = StyleSheet.create({
  masterContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  backgroundTopBG: {flex: 0.7},
  backgroundBottomBG: {flex: 0.3, backgroundColor: Colors.white},
  contentContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  topBGContainer: {
    flex: 0.45,
    paddingHorizontal: boxModelSize.paddingHorizontal,
  },
  bgImageContainer: {
    width: boxModelSize.xxl,
    height: boxModelSize.xxl,
    resizeMode: 'contain',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  loginText: {
    marginTop: boxModelSize.thirty,
  },
  logoTitle: {
    fontFamily: Fonts.primaryBold,
    color: Colors.white,
    fontSize: fontSize.h1,
  },
  logoTitleTwo: {
    fontFamily: Fonts.primaryRegular,
    color: Colors.white,
    fontSize: fontSize.h3,
  },
  backContainer: {
    marginTop: boxModelSize.xxxl,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: Fonts.primaryRegular,
    color: Colors.suvaGrey,
    fontSize: fontSize.h6,
    lineHeight: scale(15),
  },
  shadowContainerStyle: {
    // <--- Style with elevation
    backgroundColor: Colors.white,
    height: boxModelSize.thirtyFive,
    width: boxModelSize.thirtyFive,
    borderRadius: boxModelSize.eight,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.Whiskey,
  },
  footerTitle: {
    fontFamily: Fonts.primaryRegular,
    color: Colors.matterhorn,
    fontSize: fontSize.cardTitle,
  },
  loginSuccess: {
    flex: 1,
    alignItems: 'center',
  },
  imageSuccess: {
    height: verticalScale(220),
    width: verticalScale(220),
    backgroundColor: Colors.white,
  },
  countryText: {
    fontFamily: Fonts.primaryRegular,
    fontSize: fontSize.h6,
    lineHeight: boxModelSize.xl,
    marginTop: boxModelSize.eight,
    color: Colors.silver,
  },
  footerContainer: {
    borderRadius: scale(35),
    backgroundColor: Colors.white,
    flex: 0.58,
    padding: boxModelSize.paddingHorizontal,
  },
  checkBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  termsLink: {
    color: Colors.locationTitle,
  },
});

export default inject('profileStore')(observer(signUp));
