import * as event from '../../../../util/event.js'
import * as event2 from '../../../../util/event2.js'
const sdk = require('../../../../vendor/rob-web-sdk/index.js')
const md5util = require('../../../../util/md5.js')
const utils = require('../../../../util/util.js')
//获取应用实例
const app = getApp()
const windowHeight = wx.getSystemInfoSync().windowHeight
const windowWidth = wx.getSystemInfoSync().windowWidth
const recorderManager = wx.getRecorderManager();
var start;

Page({
  data: {
    percent: 1,
    autoplay: false,
    playError: false,
    controls: false,
    showFullscreenBtn: false,
    showPlayBtn: false,
    showFullscreenBtn: false,
    showCenterPlayBtn: false,
    enableProgressGesture: false,
    showProgress: false,
    playState: true,
    animationShow: false,
    showRowAnim: false,
    currentTranslateY: 0,
    touchStartingY: 0,
    videos: [],
    videoIndex: 0,
    rowCurrent: 0,
    objectFit: "contain",
    serverUrl: sdk.HOST_MEDIAT_URL + '/trans_asr_save/',
    imageUrl: sdk.HOST_MEDIAT_URL + '/trans_asr_img/',
    czindex: -1,
    rzindex: -1,
    mode: 'index',//模式表示数据来源于首页还是来源于我的（index-首页 my-我的）
    users: [],//存储视频的用户信息

    commentsList: [],
    commentVisible: false,
    placeholder: '赞美一下小可爱吧~',
    replyCommentContent: null,
    replyToOpenId: null,
    replyToNickName: null,
    commentFocus: true,
    commentEnd: false,

    displayDemo: false,
    showModal: false, // 卡片弹层


    openRecordingdis: "block",//录音图片的不同
    shutRecordingdis: "none",//录音图片的不同
    recordingTimeqwe: 0,//录音计时
    setInter: "",//录音名称
    likeChecked: true
  },
  //遮罩弹层
  submit: function () {
    this.setData({
      showModal: true
    })
  },

  preventTouchMove: function () {

  },


  go: function () {
    this.setData({
      showModal: false
    })
  },

  myevent: null,
  onLoad: function (options) {

    //处理数据加载的问题
    var that = this;
    var json_param = JSON.parse(options.videoInfo)
    var share_param = options.shareInfo
    var current = options.current
    current = parseInt(current)
    var that = this;
    console.log(json_param)
    // this.videos = [json_param]
    this.setData({
      videos: [json_param]
    })
    // wx.request({
    //   url: 'https://www.mengchongp2p.online/app/video/list',
    //   method: 'get',
    //   header: {
    //     'Content-Type': 'application/json'
    //   },
    //   success: function (res) {//这里写调用接口成功之后所运行的函数
    //     console.log('res', res.data);//调出来的数据在控制台显示，方便查看
    //     that.setData({
    //       videos: res.data.result,
    //       videoIndex: 0,
    //       currentTranslateY: -0 * windowHeight,
    //       mode: 'my',
    //     })
    //   },
    //   fail: function (res) {//这里写调用接口失败之后所运行的函数
    //     console.log('.........fail..........');
    //   }
    // })



    if (json_param) {
      var _videos = JSON.parse(json_param)
      console.log('_videos', _videos)
      var videoList = []
      let ids = []
      _videos.map(function (value, index) {
        var _value = that.filterSubject(value)
        videoList.push(_value)
        ids.push(_value['id'])
      })
      //同时获取用户信息
      sdk.getUserByIds(ids, function (userList) {
        console.log('success', userList)
        videoList.map(function (value, index) {
          if (userList) {
            userList.map(function (value2, index2) {
              if (value['id'] == value2['openid']) {
                value['userInfo'] = value2
              }
            })
          }
        })
        that.setData({
          videos: videoList,
          videoIndex: current,
          currentTranslateY: -current * windowHeight,
          mode: 'my',
        })
        that.bindEvent()
      }, function (err) {
        console.log('getUserByIds fail', err)
      })

    } else if (share_param) {
      //处理分享逻辑
      var _video = JSON.parse(share_param)
      that.setData({
        videos: [_video],
        videoIndex: 0,
      })
      that.loadData(1, function (res) {
        console.log("share init load data end", res)
      })
      that.bindEvent()
    } else {
      var that = this;
      that.loadData(0, function (res) {
        console.log("init load data end", res)
      })
      that.bindEvent()
    }

  },
  viewDemo(e) {
    let demoindex = e.currentTarget.dataset.demoindex
    wx.navigateTo({
      url: '/page/lenglish/pages/demo/demo?index=' + demoindex,
    })
  },
  bindEvent() {
    // 滑动
    this.videoChange = throttle(this.touchEndHandler, 100)
    if (this.data.mode == 'index') {
      this.myevent = event
    }
    if (this.data.mode == 'my') {
      this.myevent = event2
    }

    // 绑定updateVideoIndex事件，更新当前播放视频index
    this.myevent.on('updateVideoIndex', this, function (index) {
      console.log('event updateVideoIndex1:', index)
      this.switchVideo(this.data.rowCurrent)
      setTimeout(() => {
        this.setData({
          animationShow: false,
          playState: true,
          //czindex: -1,
        }, () => {
          // 切换src后，video不能立即播放，settimeout一下
          setTimeout(() => {
            this.vvideo.play()
          }, 50)
          setTimeout(() => {
            this.setData({
              czindex: -1,
            })
          }, 150)
        })
      }, 490)
    })

    // 绑定updateVideoRIndex事件，横向更新当前播放视频
    // this.myevent.on('updateVideoRIndex', this, function (index) {
    //   console.log('event updateVideoRIndex2:', index)
    //   let that = this
    //   let rowIndex = this.data.rowCurrent
    //   rowIndex += index
    //   this.switchVideo(rowIndex)
    //   setTimeout(() => {
    //     that.setData({
    //       animationShow: false,
    //       showRowAnim: false,
    //       //rzindex: -1,
    //       playState: true,
    //     }, () => {
    //       setTimeout(() => {
    //         that.vvideo.play()
    //       }, 50)
    //       setTimeout(() => {
    //         this.setData({
    //           rzindex: -1,
    //         })
    //       }, 150)
    //     })
    //   }, 490)
    // })
  },
  loadData(status, callback) {
    var that = this
    if (this.data.mode == 'my') {
      console.log('我的视频数据暂时通过参数传递，所以不加载。')
      return
    }

    // sdk.listPidAv(function (res) {
    //   let videoList = res.data
    //   if (videoList) {
    //     let ids = []
    //     videoList.map(function (value, index) {
    //       value = that.filterSubject(value)
    //       ids.push(value['id'])
    //     })
    //     //同时获取用户信息
    //     sdk.getUserByIds(ids, function (userList) {

    //       videoList.map(function (value, index) {
    //         if (userList) {
    //           userList.map(function (value2, index2) {
    //             if (value['id'] == value2['openid']) {
    //               value['userInfo'] = value2
    //             }
    //           })
    //         }
    //       })

    //       let newVideoList = that.data.videos
    //       if (status == 0) {
    //         newVideoList = []
    //       }
    //       that.setData({
    //         videos: newVideoList.concat(videoList)
    //       })
    //       callback(that.data.videos)

    //     }, function (err) {
    //       console.log('getUserByIds fail', err)
    //       let newVideoList = that.data.videos
    //       if (status == 0) {
    //         newVideoList = []
    //       }
    //       that.setData({
    //         videos: newVideoList.concat(videoList)
    //       })
    //       callback(that.data.videos)
    //     })
    //   }

    // })
  },
  // goUser(e) {
  //   let userid = e.currentTarget.dataset.openid
  //   console.log('userid', userid)
  //   if (!userid) {
  //     return
  //   }
  //   sdk.getUserByIds([userid], function (userList) {
  //     console.log('success', userList)
  //     let _userInfo = null
  //     userList.map(function (item, index) {
  //       if (userid == item['openid']) {
  //         _userInfo = item
  //       }
  //     })
  //     if (_userInfo) {
  //       wx.navigateTo({
  //         url: '/page/lenglish/pages/mine/mine?userInfo=' + JSON.stringify(_userInfo),
  //       })
  //     }
  //   }, function (err) {
  //     console.log('getUserByIds fail', err)
  //   })
  // },
  // goUserHome(e) {
  //   //this.pauseVideo()
  //   let userid = e.currentTarget.dataset.openid
  //   console.log('userid', userid)
  //   let videoList = this.data.videos
  //   let findUserFlag = false
  //   let params = null
  //   videoList.map(function (value, index) {
  //     console.log('openid', value['id'])
  //     if (value['id'] == userid) {
  //       params = JSON.stringify(value['userInfo'])
  //       findUserFlag = true
  //     }
  //   })
  //   if (findUserFlag) {
  //     wx.navigateTo({
  //       url: '/page/lenglish/pages/mine/mine?userInfo=' + params,
  //     })
  //   } else {
  //     wx.showToast({
  //       title: '没有找到用户!',
  //       icon: 'loading'
  //     })
  //   }
  // },
  like: function (e) {
    // 验证用户信息
    // console.log('111')
    // console.log('111',this.likeChecked)
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '跳转登录页!',
        icon: 'loading'
      })
      this.goMy()
    } else {
      var that = this
      var listVideo = that.data.videos
      wx.request({
        url: 'https://www.mengchongp2p.online/app/rank/add',
        data: {
          ownerId: app.globalData.userInfo.openId,
          videoId: that.data.videos[that.data.videoIndex].videoId
        },
        method: 'post',
        success: function () {
          listVideo.map(function (value, index) {
            if (index == that.data.videoIndex) {
              value['like'] = true
              value['likeCount']++
            }
          })

          that.setData({
            videos: listVideo,
            likeChecked: true
          })
        }
      })
      // this.setData({
      //   likeChecked: false
      // })
    }

  },
  unlike: function (e) {
    // 验证用户信息
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '跳转登录页!',
        icon: 'loading'
      })
      this.goMy()
    } else {
      var that = this
      var listVideo = that.data.videos
      let subject = listVideo[that.data.videoIndex]
      var id = md5util.hexMD5(subject['src'])
      sdk.delLike(id, function (res) {
        listVideo.map(function (value, index) {
          if (index == that.data.videoIndex) {
            value['like'] = false
          }
        })
        console.log('del like', listVideo)
        that.setData({
          videos: listVideo
        })
      })
    }
  },
  talk: function (e) {
    //设置输入框的焦点,重置数据.
    this.setData({
      commentVisible: true,
      commentEnd: false,
      commentsList: [],
    });
    this.commentPage = 1;
    this.getCommentsList()
  },
  closeTalk: function (e) {
    this.setData({
      commentVisible: false
    });
  },
  //留言回复本地赋值功能
  replyFocus: function (e) {
    var fatherCommentContent = e.currentTarget.dataset.fathercommentcontent;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickName = e.currentTarget.dataset.tonickname;
    this.setData({
      placeholder: "回复 " + toNickName,
      replyCommentContent: fatherCommentContent,
      replyToOpenId: toUserId,
      replyToNickName: toNickName,
      commentFocus: true,
    })
  },
  saveComment: function (e) {
    var that = this;
    if (!app.globalData.hasLogin) {
      wx.showToast({
        title: '跳转登录页!',
        icon: 'loading'
      })
      this.goMy()
    } else {
      var content = e.detail.value;
      wx.showLoading({
        title: '发表中,请稍等...',
        mask: true
      });
      //获取评论回复的fatherCommentId 和 toUserId
      var _toNickName = e.currentTarget.dataset.replytonickname;
      var _toOpenid = e.currentTarget.dataset.replytoopenid;
      var _toCommentContent = e.currentTarget.dataset.replycommentcontent;
      console.log('replay info', _toNickName, _toOpenid, _toCommentContent)
      let video = this.data.videos[this.data.videoIndex]
      let _id = md5util.hexMD5(video['src'])
      let userInfo = app.globalData.userInfo
      let commentContent = {
        id: _id,
        openid: userInfo['openid'],
        nickname: userInfo['nickName'],
        avatarUrl: userInfo['avatarUrl'],
        timeAgoStr: new Date().getTime(),
        comment: content,
        toOpenid: _toOpenid,
        toNickName: _toNickName,
        toCommentContent: _toCommentContent,
      }
      sdk.addComment(commentContent, function (res) {
        console.log("addComment", res)
        let _commentsList = that.data.commentsList
        _commentsList.unshift(commentContent)
        that.setData({
          commentsList: _commentsList,
          contentValue: null,
          placeholder: '有爱评论，说点儿好听的~',
          replyCommentContent: null,
          replyToOpenId: null,
          replyToNickName: null,
        })
        wx.hideLoading()
      })
    }
  },
  commentPage: 1,
  loadComment: function () {
    console.log('loadComment')
    this.getCommentsList(this.commentPage)
  },
  getCommentsList: function (page) {
    // if (this.data.commentEnd) {
    //   return
    // }
    // let video = this.data.videos[this.data.videoIndex]
    // let id = md5util.hexMD5(video['src'])
    let that = this
    wx.showLoading({
      title: '加载数据...',
    })
    wx.request({
      url: 'https://www.mengchongp2p.online/app/video/comment-list',
      method: 'get',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        videoId: that.data.videos[that.data.videoIndex].videoId
      },
      success: function (res) {//这里写调用接口成功之后所运行的函数
        console.log(res.data);//调出来的数据在控制台显示，方便查看
        wx.hideLoading();
        that.setData({
          commentsList: res.data.result
        })
      },
      fail: function (res) {//这里写调用接口失败之后所运行的函数
        console.log('.........fail..........');
      }
    })
    // sdk.listComment(id, page, function (res) {
    //   console.log('listComment', res)
    //   if (res && res.length > 0) {
    //     let _listComment = that.data.commentsList
    //     if (_listComment) {
    //       that.setData({
    //         commentsList: _listComment.concat(res)
    //       })
    //     }
    //     that.commentPage += 1
    //   } else {
    //     that.setData({
    //       commentEnd: true,
    //     })
    //   }
    // }, function end(res) {
    //   wx.hideLoading()
    // })
  },
  shareMe: function (e) {
    console.log('click share')
  },
  //分享按钮
  onShareAppMessage: function (res) {
    var that = this
    var listVideo = that.data.videos
    var videoInfo = listVideo[that.data.videoIndex];
    var video = JSON.stringify(videoInfo);
    return {
      title: "萌宠",
      path: "/page/lenglish/pages/index/index?shareInfo=" + video,
      imageUrl: videoInfo['poster'],
    }
  },
  apply() {
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '跳转登录页!',
        icon: 'loading'
      })
      this.goMy()
    } else {
      sdk.video2local(function (res) { console.log(res) }, null, app)
    }
  },
  goHome() {
    wx.redirectTo({
      url: './index',
    })
  },
  goMy() {
    //this.pauseVideo()
    wx.navigateTo({
      url: '/page/lenglish/pages/mine/mine',
    })
  },
  goRank() {
    //this.pauseVideo()
    wx.navigateTo({
      url: '/page/lenglish/pages/rank/rank',
    })
  },
  bindplay() {
    console.log('--- video play ---', this.data.playState,
      this.data.animationShow, this.data.playError)
    this.setData({
      playError: false,
      playState: true,
    })
  },
  binderror(err) {
    console.log(err)
    this.setData({
      playError: true,
    })
    // 这里针对配音播放错误的情况下找原音带翻译的文件播放
    let _videos = this.data.videos
    let _video = _videos[this.data.videoIndex]
    let _src = _video['src']
    if (this.data.rowCurrent == 1 && _src.indexOf('_dub.') != -1) {
      _src = _src.replace('_dub', '')
      _video['src'] = _src
      _videos[this.data.videoIndex] = _video
      this.setData({
        videos: _videos
      })
    }
  },
  bindtimeupdate(e) {
    let percent = (e.detail.currentTime / e.detail.duration) * 100
    this.setData({
      percent: percent.toFixed(2)
    })
  },
  filterSubject: function (_subject) {
    let that = this
    if (_subject) {
      var filename = _subject['url']
      var index = filename.lastIndexOf(".");
      var suffix = filename.substr(index + 1);
      _subject['zh_en_src'] = that.data.serverUrl + _subject['key'] + '.' + suffix
      if (_subject['lang'] == 'en') {
        _subject['zh_src'] = that.data.serverUrl + _subject['key'] + '_zh_dub.' + suffix
        _subject['en_src'] = that.data.serverUrl + _subject['key'] + '_en.' + suffix
      } else {
        _subject['en_src'] = that.data.serverUrl + _subject['key'] + '_en_dub.' + suffix
        _subject['zh_src'] = that.data.serverUrl + _subject['key'] + '_zh.' + suffix
      }
      _subject['poster'] = that.data.imageUrl + _subject['key'] + '.jpg'
      if (_subject['lang'] == 'en') {
        _subject['src'] = _subject['en_src']
      } else {
        _subject['src'] = _subject['zh_src']
      }
      //判定是否点击过喜欢
      if (true) {
        let id = md5util.hexMD5(_subject['src'])
        sdk.isLike(id, function (res) {
          _subject['like'] = res
        })
      }
    }
    return _subject
  },
  onReady: function () {
    var that = this
    this.vvideo = wx.createVideoContext("kdvideo", this)
    this.animation = wx.createAnimation({
      duration: 200,
      transformOrigin: '0 0 0'
    })
    this._animation = wx.createAnimation({
      duration: 200,
      transformOrigin: '0 0 0'
    });
    if (this.data.videoIndex > 0) {
      console.log('onReady:', -this.data.videoIndex * windowHeight)
      //初始化动画所在位置
      this.animation.translateY(-this.data.videoIndex * windowHeight).step()
      this.setData({
        animation: this.animation.export()
      })
    }
    if (!this.data.displayDemo) {
      wx.setNavigationBarTitle({
        title: "推荐视频",
      })
    }
  },
  changePlayStatus(e) {
    let touchStartingY = this.data.touchStartingY
    let deltaY = e.changedTouches[0].clientY - touchStartingY
    console.log('deltaY ', deltaY)
    if (deltaY > (windowHeight - 51)) {
      return
    }
    console.log('changePlayStatus')
    let playState = !this.data.playState
    if (playState) {
      this.vvideo.play()
    } else {
      this.vvideo.pause()
    }
    this.setData({
      playState: playState
    })
  },
  pauseVideo(e) {
    this.vvideo.pause()
    this.setData({
      playState: false,
    })
  },
  touchStart(e) {
    start = e.changedTouches[0];
  },
  touchMove(e) {
    // this.videoChange(e)
  },
  touchEnd(e) {
    console.log('------touchEnd------')
    this.videoChange(e)
  },
  touchCancel(e) {
    console.log('------touchCancel------')
  },
  touchEndHandler(e) {
    let touchStartingY = this.data.touchStartingY
    let deltaY = e.changedTouches[0].clientY - touchStartingY
    let that = this
    console.log('deltaY ', deltaY)

    let index = this.data.videoIndex
    this.getDirect(start, e.changedTouches[0], function () {
      console.log('left2right', that.data.rowCurrent)
      // let _rowCurrent = that.data.rowCurrent
      // if (_rowCurrent <= 0) {
      //   wx.showToast({
      //     title: '没有更多数据',
      //     icon: 'loading',
      //     duration: 500
      //   })
      //   return
      // }
      // that.setData({
      //   animationShow: false,
      //   rzindex: 9999,
      //   showRowAnim: true
      // }, () => {
      //   console.log('横向 切换')
      //   that.create2Anim(-windowWidth * (_rowCurrent - 1)).then((res) => {
      //     that.setData({
      //       anim: that._animation.export(),
      //     }, () => {
      //       that.myevent.emit('updateVideoRIndex', -1)
      //     })
      //   })
      // })
      // that.switch2right()

    }, function () {
      console.log('right2left', that.data.rowCurrent)
      wx.navigateTo({
        url: '/page/lenglish/pages/mine/mine',
      })

      //that.switch2left()

    }, function () {
      console.log('top2bottom', that.data.rowCurrent)
      console.log('top2bottom', index)
      // 更早地设置 animationShow
      if (index !== 0) {
        that.setData({
          animationShow: true,
          czindex: 9999,
          showRowAnim: false
        }, () => {
          console.log('-1 切换')
          that.createAnimation(-1, index).then((res) => {
            //that.switchVideo(that.data.rowCurrent)
            that.setData({
              animation: that.animation.export(),
              videoIndex: res.index,
              currentTranslateY: res.currentTranslateY,
              percent: 1
            }, () => {
              that.myevent.emit('updateVideoIndex', res.index)
            })
          })
        })
      } else {
        wx.showToast({
          title: '没有更多数据',
          icon: 'loading',
          duration: 500
        })
      }
    }, function () {
      console.log('bottom2top', that.data.rowCurrent)
      console.log('bottom2top')
      if (index !== (that.data.videos.length - 1)) {
        that.setData({
          animationShow: true,
          czindex: 9999,
          showRowAnim: false
        }, () => {
          console.log('+1 切换')
          that.createAnimation(1, index).then((res) => {
            //that.switchVideo(that.data.rowCurrent)
            that.setData({
              animation: that.animation.export(),
              videoIndex: res.index,
              currentTranslateY: res.currentTranslateY,
              percent: 1
            }, () => {
              that.myevent.emit('updateVideoIndex', res.index)
            })
          })
          let diff = that.data.videos.length - index
          if (diff <= 3) {
            that.loadData(1, function (res) {
              console.log('load more data end', res)
            })
          }
        })
      } else {
        wx.showToast({
          title: '没有更多数据',
          icon: 'loading',
          duration: 500
        })
      }
    });
  },
  create2Anim(num) {
    this._animation.translateX(num).step()

    return Promise.resolve({
    })
  },
  createAnimation(direction, index) {
    // direction为-1，向上滑动，animationImage1为(index)的poster，animationImage2为(index+1)的poster
    // direction为1，向下滑动，animationImage1为(index-1)的poster，animationImage2为(index)的poster
    index = parseInt(index)
    let videos = this.data.videos
    let currentTranslateY = this.data.currentTranslateY
    console.log('direction ', direction)
    console.log('index ', index)

    // 更新 videoIndex
    index += direction
    currentTranslateY += -direction * windowHeight
    console.log('touchStartingY: ', this.data.touchStartingY)
    console.log('currentTranslateY: ', currentTranslateY)
    this.animation.translateY(currentTranslateY).step()

    return Promise.resolve({
      index: index,
      currentTranslateY: currentTranslateY
    })
  },
  // 计算滑动方向
  getDirect(start, end, left2right, right2left, top2bottom, bottom2top) {
    let that = this
    var X = end.pageX - start.pageX,
      Y = end.pageY - start.pageY;
    if (Math.abs(X) > Math.abs(Y) && X > 50) {
      console.log("left 2 right", X);
      left2right()
    }
    else if (Math.abs(X) > Math.abs(Y) && X < -50) {
      console.log("right 2 left", X);
      right2left()
    }
    else if (Math.abs(Y) > Math.abs(X) && Y > 50) {
      console.log("top 2 bottom", Y);
      top2bottom()
    }
    else if (Math.abs(Y) > Math.abs(X) && Y < -50) {
      console.log("bottom 2 top", Y);
      bottom2top()
    }
  },
  switchVideo: function (page) {
    let that = this
    console.log('page', page)
    let _rowCurrent = page
    if (_rowCurrent > 2) {
      that.setData({
        rowCurrent: 2
      })
      return
    }
    if (_rowCurrent < 0) {
      that.setData({
        rowCurrent: 0
      })
      return
    }
    let videoList = this.data.videos
    let _subject = videoList[this.data.videoIndex]
    if (_rowCurrent == 0) {
      if (_subject['lang'] == 'en') {
        _subject['src'] = _subject['en_src']
      } else {
        _subject['src'] = _subject['zh_src']
      }
    }
    if (_rowCurrent == 1) {
      if (_subject['lang'] == 'en') {
        _subject['src'] = _subject['zh_src']
      } else {
        _subject['src'] = _subject['en_src']
      }
    }
    if (_rowCurrent == 2) {
      _subject['src'] = _subject['zh_en_src']
    }
    videoList[this.data.videoIndex] = _subject
    //console.log('videoList', videoList)
    that.setData({
      videos: videoList,
      rowCurrent: _rowCurrent,
    })
  },
  closeThis(e) {
    wx.setStorage({
      key: 'loadOpen',
      data: 'OpenTwo'
    })
    this.setData({
      isTiptrue: false,
      autoplay: true,
    })
    this.vvideo.play()
  },
  upper(e) {
    console.log('upper')
    // wx.showToast({
    //   title: '数据加载中！',
    //   icon: 'none'
    // })
  },
  lower(e) {
    console.log('lower')
    wx.showToast({
      title: '数据加载中！',
      icon: 'none',
      duration: 1000
    })
  },
  //录音计时器
  recordingTimer: function () {
    var that = this;
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function () {
        var time = that.data.recordingTimeqwe + 1;
        that.setData({
          recordingTimeqwe: time
        })
      }
      , 1000);
  },
  //开始录音
  openRecording: function () {
    var that = this;
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'loading'
      })
      this.goMy()
    } else {
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            shutRecordingdis: "block",
            openRecordingdis: "none"
          })
        }
      })
      const options = {
        duration: 60000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
        sampleRate: 16000, //采样率
        numberOfChannels: 1, //录音通道数
        encodeBitRate: 96000, //编码码率
        format: 'mp3', //音频格式，有效值 aac/mp3
        frameSize: 50, //指定帧大小，单位 KB
      }
      //开始录音计时   
      that.recordingTimer();
      //开始录音
      recorderManager.start(options);
      recorderManager.onStart(() => {
        wx.showToast({
          title: '开始录音',
          icon: 'success',
          duration: 2000
        })
        wx.showToast({
          title: '请说话',
          icon: 'loading',
        })
      });
      //错误回调
      recorderManager.onError((res) => {
        console.log(res);
      })
    }

  },

  //结束录音
  shutRecording: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          shutRecordingdis: "none",
          openRecordingdis: "block"
        })
      }
    })
    recorderManager.stop();
    recorderManager.onStop((res) => {
      wx.showToast({
        title: '结束录音',
        icon: 'success',
        duration: 2000
      })
      wx.showToast({
        title: '正在解析',
        icon: 'loading',
      })
      const { tempFilePath } = res;
      //结束录音计时  
      clearInterval(that.data.setInter);
      //上传录音
      wx.uploadFile({
        url: 'https://www.mengchongp2p.online/app/video/comment',//这是你自己后台的连接
        filePath: tempFilePath,
        name: "file",//后台要绑定的名称
        header: {
          "Content-Type": "multipart/form-data"
        },
        //参数绑定
        formData: {
          uid: app.globalData.userInfo.openId,
          videoId: that.data.videos[that.data.videoIndex].videoId,
          file: tempFilePath,
        },
        success: function (ress) {
          console.log(res);
          wx.hideLoading()
          wx.showToast({
            title: '解析完成',
            icon: 'success',
            duration: 2000
          })
          that.getCommentsList()
        },
        fail: function (ress) {
          console.log("。。录音保存失败。。");
        }
      })
    })
  },

  //录音播放
  recordingAndPlaying: function (eve) {
    wx.playBackgroundAudio({
      //播放地址
      dataUrl: '' + eve.currentTarget.dataset.gid + ''
    })
  },
})
function throttle(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}