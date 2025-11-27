# 📌 Project Features

## 👤 User Features
- **Followers** → _User_  
  متابعة مستخدمين آخرين
- **Home page ------- For Feature**  
  صفحة فيها آخر المقالات أو المقالات الموصى بيها
- **Profile (picture, bio)**  
  صفحة البروفايل فيها صورة شخصية ونبذة عن المستخدم
- **User Account Status**  
  add user account status

- **chatting - user-profile -> view user profile page for admin,user**
---

## 🛠️ Admin Features

- **Create Categories**  
  إنشاء أو تعديل أقسام المقالات (تقنية، صحة، رياضة...)
- **Manage Users**  
  التحكم في المستخدمين (حظر / تفعيل)
- **Analytics Dashboard**  
  إحصائيات (عدد المقالات، القراءات، التفاعلات)
- **Featured Articles**  
  اختيار مقالات مميزة تظهر في الصفحة الرئيسية

---

## 🚀 Future Features

- **Change username (paid)** → _User_  
  تغيير اسم المستخدم مقابل رسوم
- **Paid article, and change username in pro account** → _User_  
  مقالات مدفوعة يقدر المستخدم يبيعها أو يشتريها
- **Notifications**  
  إشعارات عند التفاعل أو الرد على تعليق
- **Drafts**  
  حفظ المقال كمسودة قبل النشر
- **Websocket in comment** → _User_  
  تعليقات مباشرة (real-time)
- **AI Recommendations**  
  اقتراح مقالات بناءً على تفضيلات المستخدم
- **Email Digest**  
  إرسال بريد أسبوعي فيه المقالات الأكثر شعبية
- **Collaborative Articles**  
  مقالات يكتبها أكثر من مستخدم مع بعض


```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowStatus } from './schemas/follow.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
  ) {}


  async getFollowers(userId: string) {
    return this.followModel
      .find({ following: userId, status: FollowStatus.accepted })
      .populate('follower', 'username email picture');
  }

  async getFollowing(userId: string) {
    return this.followModel
      .find({ follower: userId, status: FollowStatus.accepted })
      .populate('following', 'username email picture');
  }
}
```

