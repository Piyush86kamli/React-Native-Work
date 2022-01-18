import {action, makeAutoObservable} from 'mobx';
import updateProfile, {
  fetchFriendAndFamilyDetailsService,
  fetchUserDetailsByPhoneNo,
  setInitProfileWithoutFbUserID,
} from '../../services/profileServices';
import stores from '../../mobx';
import {getImageUriFromStorage} from '../../core/utils';
import Constants from '../../core/constants';
import {checkEventAssistUser} from '../../services/assistRequest';
import {
  addFriendsAndFamilyService,
  fetchFriendsAndFamilyService,
  removeFriendsAndFamilyService,
  updateFriendsAndFamilyService,
} from '../../services/friendAndFamily';
import {updateEventAssistUserData} from '../../services/findAFriend';

interface user {
  firstName: string;
  lastName: string;
  phoneNo: any[];
  hasThumbnail: boolean;
  thumbnailPath?: string;
  email?: string;
}

export default class FriendsAndFamilyStore {
  constructor() {
    makeAutoObservable(this);
  }

  loading: boolean = false;
  friendsData: any[] = [];
  familyData: any[] = [];

  addFriendAndFamily = (data: any, callback: any) => {
    addFriendsAndFamilyService(data).then(
      action((docID: any) => {
        if (docID) {
          fetchUserDetailsByPhoneNo(data.phoneNo)
            .then(
              action((userObj: any) => {
                if (userObj) {
                  if (userObj.profilePic) {
                    getImageUriFromStorage(
                      Constants.PROFILE_STORAGE_PATH,
                      userObj.profilePic,
                    )
                      .then(
                        action((imageUri: any) => {
                          data.friendFamilyImageUri = imageUri;

                          this.setFriendAndFamilyData({
                            ...data,
                            id: docID,
                            userID: userObj.userID,
                          });
                          callback ? callback() : null;
                        }),
                      )
                      .catch(
                        action((msg) => {
                          this.setFriendAndFamilyData({
                            ...data,
                            id: docID,
                            userID: userObj.userID,
                          });
                          callback ? callback() : null;
                        }),
                      );
                  } else {
                    this.setFriendAndFamilyData({
                      ...data,
                      id: docID,
                      userID: userObj.userID,
                    });
                    callback ? callback() : null;
                  }
                } else {
                  let dataFriendFamily: any = {
                    fullName: data.fullName,
                    phoneNo: data.phoneNo,
                    phoneCountryCode: data.phoneCountryCode,
                    revealYourself: true,
                  };

                  setInitProfileWithoutFbUserID(dataFriendFamily)
                    .then((userID: any) => {
                      this.setFriendAndFamilyData({
                        ...data,
                        id: docID,
                        userID: userID,
                      });
                      callback ? callback() : null;
                    })
                    .catch(
                      action((msg) => {
                        this.setFriendAndFamilyData({
                          ...data,
                          id: docID,
                          userID: null,
                        });
                        callback ? callback() : null;
                      }),
                    );
                }
              }),
            )
            .catch(
              action((err) => {
                this.setFriendAndFamilyData({
                  ...data,
                  id: docID,
                  userID: null,
                });
                callback ? callback() : null;
              }),
            );
        }
      }),
    );
  };

  editFriendAndFamily = (data: any, refID: string, callback: any) => {
    updateFriendsAndFamilyService(refID, data).then(
      action((response: any) => {
        if (response == 'SUCCESS') {
          if (data.relationType == 'Friend') {
            if (this.friendsData && this.friendsData.length > 0) {
              this.friendsData.forEach((itemObj: any, mainIndex: number) => {
                if (itemObj.id == refID) {
                  fetchUserDetailsByPhoneNo(data.phoneNo)
                    .then(
                      action((userObj: any) => {
                        if (userObj) {
                          if (userObj.profilePic) {
                            getImageUriFromStorage(
                              Constants.PROFILE_STORAGE_PATH,
                              userObj.profilePic,
                            )
                              .then(
                                action((imageUri: any) => {
                                  data.friendFamilyImageUri = imageUri;
                                  this.friendsData[mainIndex] = {
                                    ...data,
                                    id: refID,
                                    userID: userObj.userID,
                                  };
                                  callback ? callback() : null;
                                }),
                              )
                              .catch(
                                action((msg) => {
                                  this.friendsData[mainIndex] = {
                                    ...data,
                                    id: refID,
                                    userID: userObj.userID,
                                  };
                                  callback ? callback() : null;
                                }),
                              );
                          } else {
                            this.friendsData[mainIndex] = {
                              ...data,
                              id: refID,
                              userID: userObj.userID,
                            };
                            callback ? callback() : null;
                          }
                        } else {
                          let dataFriendFamily: any = {
                            fullName: data.fullName,
                            phoneNo: data.phoneNo,
                            phoneCountryCode: data.phoneCountryCode,
                            revealYourself: true,
                          };

                          setInitProfileWithoutFbUserID(dataFriendFamily)
                            .then((userID: any) => {
                              this.friendsData[mainIndex] = {
                                ...data,
                                id: refID,
                                userID: userID,
                              };
                              callback ? callback() : null;
                            })
                            .catch(
                              action((msg) => {
                                this.friendsData[mainIndex] = {
                                  ...data,
                                  id: refID,
                                  userID: null,
                                };
                                callback ? callback() : null;
                              }),
                            );
                        }
                      }),
                    )
                    .catch(
                      action((err) => {
                        this.friendsData[mainIndex] = {
                          ...data,
                          id: refID,
                          userID: null,
                        };
                        callback ? callback() : null;
                      }),
                    );
                }
              });
            }
          } else if (this.familyData && this.familyData.length > 0) {
            this.familyData.forEach((itemObj: any, mainIndex: number) => {
              if (itemObj.id == refID) {
                fetchUserDetailsByPhoneNo(data.phoneNo)
                  .then(
                    action((userObj: any) => {
                      if (userObj) {
                        if (userObj.profilePic) {
                          getImageUriFromStorage(
                            Constants.PROFILE_STORAGE_PATH,
                            userObj.profilePic,
                          )
                            .then(
                              action((imageUri: any) => {
                                data.friendFamilyImageUri = imageUri;
                                this.familyData[mainIndex] = {
                                  ...data,
                                  id: refID,
                                  userID: userObj.userID,
                                };
                                callback ? callback() : null;
                              }),
                            )
                            .catch(
                              action((msg) => {
                                this.familyData[mainIndex] = {
                                  ...data,
                                  id: refID,
                                  userID: userObj.userID,
                                };
                                callback ? callback() : null;
                              }),
                            );
                        } else {
                          this.familyData[mainIndex] = {
                            ...data,
                            id: refID,
                            userID: userObj.userID,
                          };
                          callback ? callback() : null;
                        }
                      } else {
                        let dataFriendFamily: any = {
                          fullName: data.fullName,
                          phoneNo: data.phoneNo,
                          phoneCountryCode: data.phoneCountryCode,
                          revealYourself: true,
                        };

                        setInitProfileWithoutFbUserID(dataFriendFamily)
                          .then((userID: any) => {
                            this.familyData[mainIndex] = {
                              ...data,
                              id: refID,
                              userID: userID,
                            };
                            callback ? callback() : null;
                          })
                          .catch(
                            action((msg) => {
                              this.familyData[mainIndex] = {
                                ...data,
                                id: refID,
                                userID: null,
                              };
                              callback ? callback() : null;
                            }),
                          );
                      }
                    }),
                  )
                  .catch(
                    action((err) => {
                      this.familyData[mainIndex] = {
                        ...data,
                        id: refID,
                        userID: null,
                      };
                      callback ? callback() : null;
                    }),
                  );
              }
            });
          }
        }
      }),
    );
  };

  setFriendAndFamilyData(data: any) {
    if (data.relationType == 'Friend') {
      this.friendsData.push(data);
    } else {
      this.familyData.push(data);
    }
  }

  fetchFriendAndFamily = (userID) => {
    this.friendsData = [];
    this.familyData = [];
    this.loading = true;
    fetchFriendsAndFamilyService(userID)
      .then(
        action((friendsAndFamilyMemberData: any) => {
          if (friendsAndFamilyMemberData) {
            friendsAndFamilyMemberData &&
              friendsAndFamilyMemberData.forEach(
                (itemObj: any, mainIndex: number) => {
                  fetchUserDetailsByPhoneNo(itemObj.phoneNo)
                    .then(
                      action((userObj: any) => {
                        if (userObj) {
                          if (userObj.profilePic) {
                            getImageUriFromStorage(
                              Constants.PROFILE_STORAGE_PATH,
                              userObj.profilePic,
                            )
                              .then(
                                action((imageUri: any) => {
                                  friendsAndFamilyMemberData[
                                    mainIndex
                                  ].friendFamilyImageUri = imageUri;

                                  friendsAndFamilyMemberData[mainIndex].userID =
                                    userObj.userID;

                                  this.filterFamilyData(
                                    friendsAndFamilyMemberData,
                                  );
                                }),
                              )
                              .catch(
                                action((msg) => {
                                  this.filterFamilyData(
                                    friendsAndFamilyMemberData,
                                  );
                                }),
                              );
                          } else {
                            friendsAndFamilyMemberData[mainIndex].userID =
                              userObj.userID;

                            this.filterFamilyData(friendsAndFamilyMemberData);
                          }
                        } else {
                          this.filterFamilyData(friendsAndFamilyMemberData);
                        }
                      }),
                    )
                    .catch(
                      action((err) => {
                        this.filterFamilyData(friendsAndFamilyMemberData);
                      }),
                    );
                },
              );
          }
          this.loading = false;
        }),
      )
      .catch(
        action((err) => {
          this.loading = false;
        }),
      );
  };

  filterFamilyData(friendsAndFamilyMemberData: any) {
    //Filter data
    this.friendsData = friendsAndFamilyMemberData.filter(
      (item: any) => item.relationType == 'Friend',
    );
    this.familyData = friendsAndFamilyMemberData.filter(
      (item: any) => item.relationType != 'Friend',
    );
  }

  checkFriendsAndFamilyInEvent = () => {
    let friendsAndFamilyData = [...this.friendsData, ...this.familyData];
    this.familyData = [];
    this.friendsData = [];

    friendsAndFamilyData.forEach((item, index) => {
      fetchUserDetailsByPhoneNo(item.phoneNo).then(
        action((userObj: any) => {
          if (userObj) {
            checkEventAssistUser(userObj.userID)
              .then(
                action((userData: any) => {
                  //checking if friend is inside the evnt or not
                  item.isInEvent = userData != undefined;

                  if (item.relationType == 'Friend')
                    this.friendsData.push({
                      ...item,
                      fbUserID: userObj.fbUserID,
                      assistUserID: userObj.userID,
                      deviceID: userObj.deviceId,
                    });
                  else
                    this.familyData.push({
                      ...item,
                      fbUserID: userObj.fbUserID,
                      assistUserID: userObj.userID,
                      deviceID: userObj.deviceId,
                    });
                }),
              )
              .catch(
                action(() => {
                  if (item.relationType == 'Friend')
                    this.friendsData.push(item);
                  else this.familyData.push(item);
                }),
              );
          } else {
            if (item.relationType == 'Friend') this.friendsData.push(item);
            else this.familyData.push(item);
          }
        }),
      );
    });
  };

  removeFriendAndFamily = (data: any) => {
    if (data.relationType == 'Friend') {
      this.friendsData.forEach((item: any, index) => {
        if (item && item.id == data.id) {
          this.friendsData.splice(index, 1);
          return;
        }
      });
    } else {
      this.familyData.forEach((item: any, index) => {
        if (item && item.id == data.id) {
          this.familyData.splice(index, 1);
          return;
        }
      });
    }
    removeFriendsAndFamilyService(data.id);
  };

  checkIsFriendAndFamilyExist = (
    isFriendAndFamily: string,
    phoneNo: string,
    editItemObj: any,
  ) => {
    var data = [];
    if (isFriendAndFamily == Constants.KEY_FRIENDS) {
      data = this.friendsData.filter((item) => item.phoneNo == phoneNo);
    } else {
      data = this.familyData.filter((item) => item.phoneNo == phoneNo);
    }
    if (editItemObj) {
      return data && data.length > 0 && data[0].phoneNo != editItemObj.phoneNo
        ? true
        : false;
    } else {
      return data && data.length > 0 ? true : false;
    }
  };

  updateEventAssistUser = (permission: string) => {
    updateEventAssistUserData(stores.profileStore.profile.userID, {
      accessPermission: permission,
    });
  };

  reset = () => {
    //console.log('reset');
  };
}
