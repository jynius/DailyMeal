# Universal Links & App Links 설정 파일

이 디렉토리는 iOS Universal Links와 Android App Links를 위한 검증 파일을 포함합니다.

## 파일 설명

### 1. `apple-app-site-association` (iOS)
- **목적**: iOS에서 웹 링크를 앱으로 열기 위한 검증 파일
- **필수 수정사항**:
  - `TEAM_ID`를 Apple Developer 팀 ID로 교체
  - 예: `"appID": "ABC123XYZ.com.dailymeal.app"`

### 2. `assetlinks.json` (Android)
- **목적**: Android에서 웹 링크를 앱으로 열기 위한 검증 파일
- **필수 수정사항**:
  - `SHA256_FINGERPRINT_HERE`를 실제 앱 서명 인증서의 SHA256 지문으로 교체

## SHA256 지문 얻는 방법

### Android (Debug)
```bash
cd app
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

### Android (Release)
```bash
# EAS Build를 사용하는 경우
eas credentials

# 또는 직접 keystore가 있는 경우
keytool -list -v -keystore release.keystore -alias release | grep SHA256
```

## Apple Team ID 찾는 방법

1. https://developer.apple.com/account 접속
2. "Membership Details" 섹션에서 "Team ID" 확인
3. 10자리 영숫자 조합 (예: ABC123XYZ)

## 검증 방법

### iOS Universal Links
```bash
# Apple의 검증 도구 사용
curl -i https://dailymeal.app/.well-known/apple-app-site-association

# 올바른 응답:
# - HTTP 200 OK
# - Content-Type: application/json 또는 application/pkcs7-mime
# - JSON 내용 반환
```

**중요**: HTTPS로만 접근 가능해야 하며, 리다이렉트 없이 직접 접근 가능해야 합니다.

### Android App Links
```bash
# Google의 검증 도구 사용
curl -i https://dailymeal.app/.well-known/assetlinks.json

# 올바른 응답:
# - HTTP 200 OK
# - Content-Type: application/json
# - JSON 배열 반환
```

**테스트 도구**: https://developers.google.com/digital-asset-links/tools/generator

## 주의사항

1. **HTTPS 필수**: 두 파일 모두 HTTPS로만 접근 가능해야 함
2. **리다이렉트 금지**: 301/302 리다이렉트 없이 직접 접근 가능해야 함
3. **Content-Type**: 올바른 MIME 타입 반환 필요
4. **캐시 고려**: 파일 변경 시 OS가 캐시를 업데이트하는 데 최대 24시간 소요
5. **확장자 없음**: `apple-app-site-association`은 확장자 없이 그대로 사용

## Next.js 설정

이 파일들은 `public/.well-known/` 디렉토리에 있으며, Next.js가 자동으로 정적 파일로 제공합니다.

URL: 
- `https://yourdomain.com/.well-known/apple-app-site-association`
- `https://yourdomain.com/.well-known/assetlinks.json`

## Nginx 설정 (필요시)

Nginx를 사용하는 경우 다음 설정을 추가하세요:

```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
}

location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Content-Type application/json;
}
```

## 참고 문서

- iOS Universal Links: https://developer.apple.com/ios/universal-links/
- Android App Links: https://developer.android.com/training/app-links
- Expo Deep Linking: https://docs.expo.dev/guides/deep-linking/
