# 后台文档
host : http://123.207.138.78:8888/
## 纳新接口
###  1. 登录接口`host +getverCode：`
#### 1.参数： 无 （带cookie jsonp不用写，cros ajax必须带上一些参数，具体百度,此接口会修改，留口)
#### 2.返回值：

1.已经登陆但是没有报名

		{ err: false,
		  obj: {
             	type: 'it has access',
          	    inf: req.session.personinf
         }

2.已经登陆且已经报名


    { 
        err: false, 
        obj: {
   		      type: 'it has login',
              inf: obj.result[0]
     }

3.没有登陆但是传参了

    { err: true, errtype: 'get vercode too mary params' }

4.获取验证码成功

    {
   		err: false,
        result: {
              session: sessionid,
              src: srcs
         }
    }


5.获取验证码失败

    {
                err: true,
                errtype: "can't get vercode！"
            }
###  2.登陆接口 `"host+getinformation"` 
#### 1.参数：name：学号，password:密码(之后会加密先用明文，记得留验证口)，session:验证码的sessionID,vercode验证码
#### 2. 返回值：
1. 没有参数:
`{ err: true, errtype: 'get info no params' }`
2. 参数数目错误
`{ err: true, errtype: 'Please check the number and type of the parameters' }`
3. 登陆成功返回爬取数据(之后会验证需保存stateobj，此接口后续可能更改) 
```
{
    err: false,
    result: {
                state: 'access', 
                stateobj:obj.result.inf
            }
}
```
### 3.报名接口 `host+login` 
#### 1.参数 username：学号 2.name:姓名 3.sex:性别 4. class：班级 5. direction：方向 6. tel ：电话 7. message：留言 (此接口带session,jsonp不需要修改直接发，ajaxcors需要添加参数 自行百度。。。)
#### 2. 返回值
1. 没有 session 状态为未通过
```
{ err: true, errtype: 'no access' }
```
2. 没有session
```
{ err: true, errtype: 'please check session' }
```
3. 参数不足
```
{ err: true, errtype: 'please check parameters' }
```
4. 参数和session中不符
```
{ err: true, errtype: 'parameters err' }
```
5. 报名成功
```
{ err: false, errtype: 'login success!' }
```
6. 报名失败 (后台错误)
```
{ err: true, errtype: 'login error!' }
```
7. 重复报名
```
{ err: true, errtype: 'it has login' }
```

