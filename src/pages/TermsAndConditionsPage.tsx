import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './TermsAndConditionsPage.module.css';

const TermsAndConditionsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isKorean = i18n.language === 'kr';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {isKorean ? '이용약관' : 'Terms and Conditions'}
        </h1>
        
        {isKorean ? (
          <>
            <p className={styles.intro}>
              <strong>제1장 총칙</strong>
            </p>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제1조 목적</h2>
              <p>
                이 약관은 원셀메디의원(이하 '본원')에서 제공하는 서비스 이용조건 및 절차에 관한 사항과 기타 필요한 사항을 본원과 이용자의 권리, 의미 및 책임사항 등을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제2조 약관의 효력과 변경</h2>
              <p>
                (1) 이 약관은 이용자에게 공시함으로서 효력이 발생합니다.
                <br />
                (2) 본원은 사정 변경의 경우와 영업상 중요사유가 있을 때 약관을 변경할 수 있으며, 변경된 약관은 전항과 같은 방법으로 효력이 발생합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제3조 약관 외 준칙</h2>
              <p>
                이 약관에 명시되지 않은 사항이 관계법령에 규정되어 있을 경우에는 그 규정에 따릅니다.
              </p>
            </section>

            <p className={styles.intro}>
              <strong>제2장 회원 가입과 서비스 이용</strong>
            </p>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제1조 회원의 정의</h2>
              <p>
                회원이란 본원에서 회원으로 적합하다고 인정하는 일반 개인으로 본 약관에 동의하고 서비스의 회원가입 양식을 작성하고 'ID'와 '비밀번호'를 발급받은 사람을 말합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제2조 서비스 가입의 성립</h2>
              <p>
                (1) 서비스 가입은 이용자의 이용신청에 대한 본원의 이용승낙과 이용자의 약관내용에 대한 동의로 성립됩니다.
                <br />
                (2) 회원으로 가입하여 서비스를 이용하고자 하는 희망자는 본원에서 요청하는 개인 신상정보를 제공해야 합니다.
                <br />
                (3) 이용자의 가입신청에 대하여 본원에서 승낙한 경우, 본원은 회원 ID와 기타 본원에서 필요하다고 인정하는 내용을 이용자에게 통지합니다.
                <br />
                (4) 가입할 때 입력한 ID는 변경할 수 없으며, 한 사람에게 오직 한 개의 ID가 발급됩니다.
                <br />
                (5) 본원은 다음 각 호에 해당하는 가입신청에 대하여는 승낙하지 않습니다.
                <br />
                가. 다른 사람의 명의를 사용하여 신청하였을 때
                <br />
                나. 본인의 실명으로 신청하지 않았을 때
                <br />
                다. 가입 신청서의 내용을 허위로 기재하였을 때
                <br />
                라. 사회의 안녕과 질서 혹은 미풍양속을 저해할 목적으로 신청하였을 때
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제3조 서비스 이용 및 제한</h2>
              <p>
                (1) 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.
                <br />
                (2) 전항의 서비스 이용시간은 시스템 정기점검 등 본원에서 필요한 경우, 회원에게 사전 통지한 후 제한할 수 있습니다.
                <br />
                (3) 서비스 내용 중 온라인상담은 답변하는 담당자의 개인사정에 따라 1일 24시간 서비스가 불가능 할 수도 있습니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제4조 서비스의 사용료</h2>
              <p>
                (1) 서비스는 회원으로 등록한 모든 사람들이 무료로 사용할 수 있습니다.
                <br />
                (2) 본원에서 서비스를 유료화할 경우 유료화의 시기, 정책, 비용에 대하여 유료화 실시 이전에 서비스에 공시하여야 합니다.
              </p>
            </section>

            <p className={styles.intro}>
              <strong>제3장 서비스 탈퇴, 재가입 및 이용 제한</strong>
            </p>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제1조 서비스 탈퇴</h2>
              <p>
                (1) 회원이 서비스의 탈퇴를 원하면 회원 본인이 직접 전자메일을 통해 운영자에게 해지 신청을 요청해야 합니다.
                <br />
                (2) 탈퇴 신청시 본인임을 알 수 있는 이름, 주민등록번호, ID, 전화번호, 해지사유를 알려주면, 가입기록과 일치 여부를 확인한 후 가입을 해지합니다.
                <br />
                (3) 탈퇴 여부는 기존의 ID와 비밀번호로 로그인이 되지 않으면 해지된 것입니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제2조 서비스 재가입</h2>
              <p>
                (1) 제1조에 의하여 서비스에서 탈퇴한 사용자가 재가입을 원할 경우, 회원 본인이 직접 전자메일을 통해 운영자에게 재가입을 요청하면 됩니다.
                <br />
                (2) 재가입 요청 시 본인임을 알 수 있는 이름, 주민등록번호, ID, 전화번호를 알려주면 재가입 처리가 이루어집니다.
                <br />
                (3) 기존의 ID와 비밀번호로 로그인이 되면 재가입이 이루어진 것입니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제3조 서비스 이용제한</h2>
              <p>
                본원은 회원이 다음 사항에 해당하는 행위를 하였을 경우, 사전통지 없이 이용계약을 해지하거나 기간을 정하여 서비스 이용을 중지할 수 있습니다.
                <br />
                가. 공공 질서 및 미풍 양속에 반하는 경우
                <br />
                나. 범죄적 행위에 관련되는 경우
                <br />
                다. 국익 또는 사회적 공익을 저해할 목적으로 서비스 이용을 계획 또는 실행할 경우
                <br />
                라. 타인의 ID 및 비밀번호를 도용한 경우
                <br />
                마. 타인의 명예를 손상시키거나 불이익을 주는 경우
                <br />
                바. 같은 사용자가 다른 ID로 이중 등록을 한 경우
                <br />
                사. 서비스에 위해를 가하는 등 건전한 이용을 저해하는 경우
                <br />
                아. 기타 관련 법령이나 본원에서 정한 이용조건에 위배되는 경우
              </p>
            </section>

            <p className={styles.intro}>
              <strong>제4장 서비스에 관한 책임의 제한</strong>
            </p>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제1조 온라인상담</h2>
              <p>
                (1) 본원은 서비스의 회원 혹은 사용자들의 상담내용이 상담의사와 서비스 관리자를 제외한 제3자에게 유출되지 않도록 최선을 다해 보안을 유지하려고 노력합니다. 그러나 다음과 같은 경우에는 상담 내용 공개 및 상실에 대하여 본원의 책임이 없습니다.
                <br />
                가. 사용자의 부주의로 암호가 유출되어 상담내용이 공개되는 경우
                <br />
                나. 사용자가 '삭제' 기능을 사용하여 상담을 삭제하였을 경우
                <br />
                다. 천재지변이나 그 밖의 본원에서 통제할 수 없는 상황에 의하여 상담내용이 공개되거나 상담내용이 상실되었을 경우
                <br />
                (2) 회원이 신청한 상담에 대한 종합적이고 적절한 답변을 위하여 담당자들은 상담내용과 답변을 참고할 수 있습니다.
                <br />
                (3) 서비스에서 진행된 상담의 내용은 개인 신상정보를 삭제한 다음 아래와 같은 목적으로 사용할 수 있습니다.
                <br />
                가. 학술활동
                <br />
                나. 인쇄물, CD-ROM 등의 저작활동
                <br />
                다. FAQ, 추천상담 등의 서비스 내용의 일부
                <br />
                (4) 상담에 대한 답변내용은 각 담당자의 지식을 바탕으로 한 주관적인 답변으로 본원의 서비스 의견을 대표하지는 않습니다.
                <br />
                (5) 아래와 같은 상담을 신청하는 경우에는 온라인상담 전체 또는 일부 제공하지 않을 수 있습니다.
                <br />
                가. 같은 내용의 상담을 반복하여 신청하는 경우
                <br />
                나. 상식에 어긋나는 표현을 사용하여 상담을 신청하는 경우
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제2조 정보 서비스</h2>
              <p>
                (1) 서비스에서 제공되는 내용은 개략적이며 일반적인 내용이고 정보제공만을 위해 제공됩니다. 서비스에서 제공되는 정보나 상담은 절대로 의학적인 진단을 대신할 수 없습니다. 서비스에서 제공되는 정보나 상담은 결코 의학적 진단, 진료 혹은 치료를 대신하려는 목적이 아닙니다. 회원의 건강상태에 관한 의문점이나 걱정이 있다면 실제 전문의사를 찾아 진단을 받아야 합니다. 어떠한 경우에도 서비스에서 제공하는 정보때문에 의사의 진단을 무시하거나, 진단, 진료 혹은 치료받는 것을 미루지 마십시오.
                <br />
                (2) 본원은 서비스에서 언급된 어떠한 특정한 검사나 제품 혹은 치료법도 추천하지 않습니다. 서비스에 표현된 의견은 모두 해당 상담의사의 의견입니다. 본원은 서비스에서 제공된 어떠한 문서나 상담의 내용에 대해서도 책임을 지지 않습니다.
                <br />
                (3) 본 서비스의 정보, 서비스에 참여하는 전문의사 혹은 서비스를 사용하는 다른 회원이나 방문객의 의견을 받아들이는 것은 전적으로 사용자의 판단에 따르는 것입니다. 따라서 본원에서는 회원에게 제공된 어떠한 제품의 활용, 정보, 아이디어 혹은 지시로부터 비롯하는 어떠한 손해, 상해 혹은 그 밖의 불이익에 대한 책임을 지지 않습니다.
              </p>
            </section>

            <p className={styles.intro}>
              <strong>제5장 의무</strong>
            </p>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제1조 회사의 의무</h2>
              <p>
                (1) 본원은 특별한 사정이 없는 한 회원이 서비스를 이용할 수 있도록 합니다.
                <br />
                (2) 본원은 이 약관에서 정한 바에 따라 계속적, 안정적으로 서비스를 제공할 의무가 있습니다.
                <br />
                (3) 본원은 회원으로부터 소정의 절차에 의해 제기되는 의견에 대해서 적절한 절차를 거쳐 처리하며, 처리 시 일정기간이 소요될 경우 회원에게 그 사유와 처리 일정을 알려주어야 합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>제2조 회원정보 보안의 의무</h2>
              <p>
                (1) 회원의 ID와 비밀번호에 관한 모든 관리의 책임은 회원에게 있습니다.
                <br />
                (2) 회원은 서비스의 일부로 보내지는 서비스의 전자우편을 받는 것에 동의합니다.
                <br />
                (3) 자신의 ID가 부정하게 사용된 경우, 회원은 반드시 본원에 그 사실을 통보해야 합니다.
                <br />
                (4) 본원은 개인의 신분 확인이 가능한 정보를 회원 혹은 사용자의 사전허락 없이 본원과 관계가 없는 제3자에게 팔거나 제공하지 않습니다. 그러나 본원은 자발적으로 제공된 등록된 정보를 다음과 같은 경우에 활용할 수 있습니다.
                <br />
                가. 회원들에게 유용한 새 기능, 정보, 서비스 개발에 필요한 정보를 개발자들에게 제공하는 경우
                <br />
                나. 광고주들에게 서비스 회원과 사용자 집단에 대한 통계적(결코 회원 개개인의 신분이 드러나지 않는) 정보를 제공하는 경우
                <br />
                다. 회원과 사용자 선호에 따른 광고 또는 서비스를 실시하기 위하여 회사에서 사용하는 경우
                <br />
                (5) 게시판 등의 커뮤니케이션 공간(이하 커뮤니케이션 공간)에 개인신분 확인이 가능한 정보(사용자 이름, ID, e-mail 주소 등)가 자발적으로 공개될 수 있습니다. 이런 경우 공개된 정보가 제3자에 의해 수집되고, 연관되어지며, 사용될 수 있으며 제3자로부터 원하지 않는 메시지를 받을 수도 있습니다. 제3자의 그러한 행위는 본원에서 통제할 수 없습니다. 따라서 본원은 본원에서 통제할 수 없는 방법에 의한 회원정보의 발견 가능성에 대해 아무런 보장을 하지 않습니다.
                <br />
                (6) 본원은 서비스의 사용의 편의를 위하여 Cookie 기술을 사용할 수 있습니다. Cookie란 다시 방문하는 사용자를 파악하고 그 사용자의 계속된 접속과 개인화된 서비스 제공을 돕기 위해 웹사이트가 사용하는 작은 텍스트 파일입니다. 일반적으로 Cookie는 Cookie를 부여한 사이트 밖에서는 의미가 없는 유일한 번호를 사용자에게 부여하는 방식으로 작동합니다. Cookie는 사용자의 시스템 내부로 침입하지 않으며 사용자의 파일에 위험하지 않습니다. 본원은 서비스의 광고주나 관련있는 제3자가 Cookie를 사용하는 것을 막을 수 없습니다. 회원 혹은 사용자가 Cookie를 사용한 정보수집을 원하지 않는 경우에는 웹 브라우저에서 Cookie를 받아들일지 여부를 조절할 수 있습니다. 하지만 서비스(특히, 개인화된 정보)가 제대로 작동하기 위해서는 Cookie의 사용이 필요할 수 있습니다.
                <br />
                (7) 본원은 회원의 정보를 서비스 또는 회사와 업무제휴 업체간에 상호 제공/활용할 수 있습니다.
              </p>
            </section>

            <p className={styles.intro}>
              <strong>제6장 분쟁조정</strong>
            </p>

            <section className={styles.section}>
              <p>
                (1) 본 이용약관에 규정된 것을 제외하고 발생하는 서비스 이용에 관한 제반문제에 관한 분쟁은 최대한 쌍방합의에 의해 해결하도록 한다.
                <br />
                (2) 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의 소재지를 관할하는 법원을 관할법원으로 합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>부칙</h2>
              <p>
                이 약관은 2024년 11월 22일 시행합니다.
              </p>
            </section>
          </>
        ) : (
          // English version (placeholder - you can translate the Korean content if needed)
          <div className={styles.englishVersion}>
            <p>This page is available in Korean only.</p>
            <p>Please switch to Korean language to view the Terms and Conditions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
