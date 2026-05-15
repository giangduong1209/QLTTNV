export const exportEmployeeWord = (employee: any) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };
  const fullName = employee.fullName.toUpperCase();

  const html = `
    <html> <head> <meta charset='utf-8'>
      <style>
        body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.5; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .italic { font-style: italic; }
        table { width: 100%; border-collapse: collapse; }
        p { margin: 4px 0; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="title">THÔNG TIN CHI TIẾT NHÂN VIÊN</div>
      <table>
        <tr>
          <td>
            <p>1) Họ và tên khai sinh (viết chữ in hoa): <span class="font-bold uppercase">${fullName}</span></p>
            <table style="width: 100%;">
              <tr>
                <td style="width: 50%; padding: 0;">2) Sinh ngày: ${employee.dateOfBirth ? formatDate(employee.dateOfBirth) : ""}</td>
                <td style="width: 50%; padding: 0;">3) Giới tính: ${employee.gender || ""}</td>
              </tr>
            </table>
            <p>4) Nơi sinh: ${employee.address || ""}</p>
            <p>5) Quê quán: ${employee.address || ""}</p>
            <table style="width: 100%;">
              <tr>
                <td style="width: 50%; padding: 0;">6) Dân tộc: ${employee.nationality || ""}</td>
                <td style="width: 50%; padding: 0;">7) Tôn giáo: ${employee.religion || ""}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="margin-top: 10px;">
        <p>6) Nơi ở hiện nay: ${employee.currentAddress || employee.address || ""}</p>
        <p>7) Nghề nghiệp khi được tuyển dụng: ${employee.job || ""}</p>
        <p>8) Ngày tuyển dụng: ${employee.joinDate ? formatDate(employee.joinDate) : ""}</p>
        <p>9) Chức danh (chức vụ) công tác hiện tại: ${employee.positionId?.name || ""}</p>
        <p>10) Trình độ giáo dục phổ thông: ${employee.educationLevel || ""}</p>
        <p>11) Trình độ chuyên môn cao nhất: ${employee.educationLevel || ""}</p>
        <p>12) Số chứng minh nhân dân/CCCD: ${employee.idCard || ""} </p>
        <p>13) Loại hợp đồng: ${employee.contractType || ""}</p>
      </div>

    </body>
    </html>
  `;

  const blob = new Blob(['\\ufeff', html], {
    type: 'application/msword'
  });

  const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SoYeuLyLich_${employee.employeeCode || "NV"}.doc`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
