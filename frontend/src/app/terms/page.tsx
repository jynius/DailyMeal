'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">서비스 이용약관</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>이 약관은 DailyMeal(이하 "회사")이 제공하는 식사 기록 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제2조 (정의)</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>"서비스"란 회사가 제공하는 식사 기록, 공유, 지도 표시 등의 모든 서비스를 의미합니다.</li>
              <li>"회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 자를 의미합니다.</li>
              <li>"게시물"이란 회원이 서비스에 게시한 식사 사진, 평점, 댓글, 메모 등의 모든 정보를 의미합니다.</li>
              <li>"아이디"란 회원의 식별과 서비스 이용을 위하여 회원이 등록한 이메일 주소를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.</li>
              <li>회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경사항을 시행일자 7일 전부터 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 이용계약을 해지할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제4조 (회원가입)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회원가입은 이용자가 약관의 내용에 동의하고 회사가 정한 절차에 따라 회원가입 신청을 하며, 회사가 이를 승낙함으로써 체결됩니다.</li>
              <li>회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                  <li>다른 사람의 명의를 사용하여 신청한 경우</li>
                  <li>허위의 정보를 기재하거나 회사가 요구하는 내용을 기재하지 않은 경우</li>
                  <li>만 14세 미만 아동이 법정대리인의 동의를 얻지 아니한 경우</li>
                  <li>이용자의 귀책사유로 승인이 불가능하거나 기타 규정한 제반 사항을 위반하여 신청하는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제5조 (회원 탈퇴 및 자격 상실)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회원은 언제든지 회사에 탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.</li>
              <li>회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 정보를 도용하는 등 질서를 위협하는 경우</li>
                  <li>서비스를 이용하여 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제6조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회사는 회원에게 다음과 같은 서비스를 제공합니다.
                <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                  <li>식사 사진 등록 및 관리</li>
                  <li>식사 평점 및 메모 작성</li>
                  <li>GPS 기반 위치 정보 저장</li>
                  <li>지도에 식사 장소 표시</li>
                  <li>실시간 피드 및 소셜 기능</li>
                  <li>댓글 및 좋아요 기능</li>
                  <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
                </ul>
              </li>
              <li>회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
              <li>서비스의 내용, 이용방법, 이용시간에 대하여 변경이 있는 경우에는 변경사유, 변경될 서비스의 내용 및 제공일자 등을 그 변경 전 7일 이상 해당 서비스 초기화면에 게시합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제7조 (서비스의 중단)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제8조 (게시물의 관리)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회원이 작성한 게시물에 대한 모든 권리 및 책임은 이를 게시한 회원에게 있습니다.</li>
              <li>회사는 다음 각 호에 해당하는 게시물이나 자료를 사전통지 없이 삭제하거나 이동 또는 등록 거부를 할 수 있습니다.
                <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                  <li>다른 회원 또는 제3자에게 심한 모욕을 주거나 명예를 손상시키는 내용인 경우</li>
                  <li>공공질서 및 미풍양속에 위반되는 내용을 유포하거나 링크시키는 경우</li>
                  <li>불법복제 또는 해킹을 조장하는 내용인 경우</li>
                  <li>영리를 목적으로 하는 광고일 경우</li>
                  <li>범죄와 결부된다고 객관적으로 인정되는 내용일 경우</li>
                  <li>다른 이용자 또는 제3자의 저작권 등 기타 권리를 침해하는 내용인 경우</li>
                  <li>회사에서 규정한 게시물 원칙에 어긋나거나, 게시판 성격에 부합하지 않는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제9조 (저작권의 귀속 및 이용제한)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
              <li>회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
              <li>회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제10조 (회원의 의무)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회원은 다음 행위를 하여서는 안 됩니다.
                <ul className="list-disc list-inside space-y-1 ml-6 mt-1">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제11조 (회사의 의무)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</li>
              <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 회원의 개인정보 보호를 위한 보안 시스템을 갖추어야 합니다.</li>
              <li>회사는 서비스이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제12조 (개인정보보호)</h2>
            <p>회사는 관련법령이 정하는 바에 따라서 회원 등록정보를 포함한 회원의 개인정보를 보호하기 위하여 노력합니다. 회원 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제13조 (책임제한)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
              <li>회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제14조 (준거법 및 재판관할)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>회사와 회원 간 제기된 소송은 대한민국법을 준거법으로 합니다.</li>
              <li>회사와 회원 간 발생한 분쟁에 관한 소송은 제소 당시의 회원의 주소에 의하고, 주소가 없는 경우 거소를 관할하는 지방법원의 전속관할로 합니다. 단, 제소 당시 회원의 주소 또는 거소가 명확하지 아니한 경우의 관할법원은 민사소송법에 따라 정합니다.</li>
            </ol>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="font-semibold mb-2">부칙</p>
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
