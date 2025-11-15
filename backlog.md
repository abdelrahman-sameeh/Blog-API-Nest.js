# 📌 Project Features

## 👤 User Features
- **Home page**  
  صفحة فيها آخر المقالات أو المقالات الموصى بيها
- **Followers** → _User_  
  متابعة مستخدمين آخرين
- **Profile (picture, bio)**  
  صفحة البروفايل فيها صورة شخصية ونبذة عن المستخدم
- **User Account Status**  
  add user account status

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
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FollowStatus {
  pending = 'pending',
  accepted = 'accepted',
  blocked = 'blocked',
}

@Schema({ timestamps: true })
export class Follow extends Document {
  // الشخص اللي عمل follow
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  follower: Types.ObjectId;

  // الشخص اللي اتعمل له follow
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  following: Types.ObjectId;

  // الحالة: pending - accepted - blocked
  @Prop({ enum: FollowStatus, default: FollowStatus.pending })
  status: FollowStatus;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowStatus } from './schemas/follow.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
  ) {}

  async followUser(followerId: string, followingId: string) {
    // لو المستخدم بالفعل متابع
    const existing = await this.followModel.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existing) return existing;

    const follow = new this.followModel({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
      status: FollowStatus.pending, // ممكن تكون accepted لو مافيش نظام موافقة
    });

    return follow.save();
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.followModel.deleteOne({
      follower: followerId,
      following: followingId,
    });
  }

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

