'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보 처리방침</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="mb-2">DailyMeal(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>회원 가입 및 관리</li>
              <li>서비스 제공 및 개선</li>
              <li>식사 기록 저장 및 관리</li>
              <li>위치 기반 서비스 제공</li>
              <li>고객 문의 응대 및 불만 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 수집하는 개인정보 항목</h2>
            
            <h3 className="font-semibold mt-4 mb-2">필수 항목</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>이메일 주소</li>
              <li>비밀번호 (암호화 저장)</li>
              <li>닉네임</li>
            </ul>
            
            <h3 className="font-semibold mt-4 mb-2">선택 항목</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>프로필 사진</li>
              <li>식사 사진</li>
              <li>위치 정보 (GPS 좌표)</li>
              <li>식사 장소 주소</li>
              <li>식사 평점 및 메모</li>
            </ul>
            
            <h3 className="font-semibold mt-4 mb-2">자동 수집 항목</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>서비스 이용 기록</li>
              <li>접속 로그</li>
              <li>기기 정보</li>
              <li>IP 주소</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="mb-2">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>회원 탈퇴 시까지 (단, 관계 법령에 따라 보존 필요 시 해당 기간)</li>
              <li>식사 기록: 사용자가 삭제하기 전까지</li>
              <li>위치 정보: 사용자가 삭제하기 전까지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 개인정보 처리 위탁</h2>
            <p className="mb-2">회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            <div className="mt-2">
              <p className="font-semibold">클라우드 서비스 제공</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>수탁업체: Amazon Web Services (AWS), Cloudflare</li>
                <li>위탁업무: 서버 호스팅, 데이터 저장</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="mb-2">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-2">권리 행사는 앱 내 설정 메뉴 또는 이메일(support@dailymeal.life)을 통해 하실 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 개인정보의 파기</h2>
            <p className="mb-2">회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
            <div className="mt-2">
              <p className="font-semibold">파기 절차</p>
              <p className="ml-4">이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</p>
              
              <p className="font-semibold mt-2">파기 방법</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>전자적 파일 형태: 복구 및 재생되지 않도록 안전하게 삭제</li>
                <li>기록물, 인쇄물: 분쇄하거나 소각</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. 개인정보 보호책임자</h2>
            <div className="ml-4">
              <p>이름: DailyMeal 개인정보 보호팀</p>
              <p>이메일: privacy@dailymeal.life</p>
              <p>전화: (문의 이메일로 연락 주시기 바랍니다)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. 개인정보의 안전성 확보조치</h2>
            <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보에 대한 접근 제한</li>
              <li>개인정보를 저장하는 물리적 장소에 대한 접근통제</li>
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>접속기록의 보관 및 위변조 방지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. 위치정보 수집 및 이용</h2>
            <p className="mb-2">DailyMeal은 식사 장소 기록을 위해 위치정보를 수집합니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>수집 방법: 기기의 GPS를 통한 자동 수집</li>
              <li>이용 목적: 식사 장소 기록, 지도 표시</li>
              <li>보유 기간: 사용자가 삭제하기 전까지</li>
              <li>거부 권리: 위치정보 수집을 거부할 수 있으며, 이 경우 위치 기반 기능 이용이 제한됩니다</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. 개인정보 처리방침 변경</h2>
            <p>이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-600">
              공고일자: 2025년 10월 12일<br />
              시행일자: 2025년 10월 12일
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
