namespace Nightlight_Launcher
{
	// Token: 0x02000005 RID: 5
	public partial class GTAIV : global::System.Windows.Forms.Form
	{
		// Token: 0x0600001D RID: 29 RVA: 0x00004090 File Offset: 0x00002290
		protected override void Dispose(bool disposing)
		{
			bool flag = disposing && this.components != null;
			bool flag2 = flag;
			bool flag3 = flag2;
			bool flag4 = flag3;
			bool flag5 = flag4;
			if (flag5)
			{
				this.components.Dispose();
			}
			base.Dispose(disposing);
		}

		// Token: 0x0600001E RID: 30 RVA: 0x000040D4 File Offset: 0x000022D4
		private void InitializeComponent()
		{
			this.selectedFolderTextBox = new global::System.Windows.Forms.TextBox();
			this.label1 = new global::System.Windows.Forms.Label();
			this.button1 = new global::System.Windows.Forms.Button();
			this.button2 = new global::System.Windows.Forms.Button();
			this.button3 = new global::System.Windows.Forms.Button();
			this.labelOptiBoost1 = new global::System.Windows.Forms.Label();
			this.OpenGameLocation = new global::System.Windows.Forms.Button();
			base.SuspendLayout();
			this.selectedFolderTextBox.Location = new global::System.Drawing.Point(83, 178);
			this.selectedFolderTextBox.Name = "selectedFolderTextBox";
			this.selectedFolderTextBox.Size = new global::System.Drawing.Size(387, 20);
			this.selectedFolderTextBox.TabIndex = 0;
			this.selectedFolderTextBox.TextChanged += new global::System.EventHandler(this.textBox1_TextChanged);
			this.label1.AutoSize = true;
			this.label1.BackColor = global::System.Drawing.Color.Transparent;
			this.label1.Font = new global::System.Drawing.Font("Trebuchet MS", 12f, global::System.Drawing.FontStyle.Bold);
			this.label1.ForeColor = global::System.Drawing.SystemColors.ControlLightLight;
			this.label1.Location = new global::System.Drawing.Point(79, 155);
			this.label1.Name = "label1";
			this.label1.Size = new global::System.Drawing.Size(109, 22);
			this.label1.TabIndex = 1;
			this.label1.Text = "Game folder:";
			this.button1.Font = new global::System.Drawing.Font("Trebuchet MS", 9.75f);
			this.button1.Location = new global::System.Drawing.Point(280, 271);
			this.button1.Name = "button1";
			this.button1.Size = new global::System.Drawing.Size(112, 39);
			this.button1.TabIndex = 2;
			this.button1.Text = "install modules";
			this.button1.UseVisualStyleBackColor = true;
			this.button1.Click += new global::System.EventHandler(this.button1_Click);
			this.button2.Font = new global::System.Drawing.Font("Trebuchet MS", 9.75f);
			this.button2.Location = new global::System.Drawing.Point(465, 271);
			this.button2.Name = "button2";
			this.button2.Size = new global::System.Drawing.Size(112, 39);
			this.button2.TabIndex = 3;
			this.button2.Text = "Start Game";
			this.button2.UseVisualStyleBackColor = true;
			this.button2.Click += new global::System.EventHandler(this.button2_Click);
			this.button3.Font = new global::System.Drawing.Font("Trebuchet MS", 8.25f, global::System.Drawing.FontStyle.Regular, global::System.Drawing.GraphicsUnit.Point, 0);
			this.button3.Location = new global::System.Drawing.Point(492, 178);
			this.button3.Name = "button3";
			this.button3.Size = new global::System.Drawing.Size(120, 21);
			this.button3.TabIndex = 4;
			this.button3.Text = "Change Location";
			this.button3.UseVisualStyleBackColor = true;
			this.button3.Click += new global::System.EventHandler(this.button3_Click);
			this.labelOptiBoost1.AutoSize = true;
			this.labelOptiBoost1.BackColor = global::System.Drawing.Color.Transparent;
			this.labelOptiBoost1.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 24f, global::System.Drawing.FontStyle.Bold);
			this.labelOptiBoost1.ForeColor = global::System.Drawing.Color.WhiteSmoke;
			this.labelOptiBoost1.Location = new global::System.Drawing.Point(191, 66);
			this.labelOptiBoost1.Name = "labelOptiBoost1";
			this.labelOptiBoost1.Size = new global::System.Drawing.Size(346, 44);
			this.labelOptiBoost1.TabIndex = 6;
			this.labelOptiBoost1.Text = "Grand Theft Auto IV";
			this.OpenGameLocation.Font = new global::System.Drawing.Font("Trebuchet MS", 8.25f);
			this.OpenGameLocation.Location = new global::System.Drawing.Point(95, 271);
			this.OpenGameLocation.Name = "OpenGameLocation";
			this.OpenGameLocation.Size = new global::System.Drawing.Size(119, 39);
			this.OpenGameLocation.TabIndex = 7;
			this.OpenGameLocation.Text = "Open selected folder";
			this.OpenGameLocation.UseVisualStyleBackColor = true;
			this.OpenGameLocation.Click += new global::System.EventHandler(this.OpenGameLocation_Click);
			base.AutoScaleDimensions = new global::System.Drawing.SizeF(6f, 13f);
			base.AutoScaleMode = global::System.Windows.Forms.AutoScaleMode.Font;
			this.BackColor = global::System.Drawing.Color.FromArgb(23, 21, 35);
			base.ClientSize = new global::System.Drawing.Size(695, 501);
			base.Controls.Add(this.OpenGameLocation);
			base.Controls.Add(this.labelOptiBoost1);
			base.Controls.Add(this.button3);
			base.Controls.Add(this.button2);
			base.Controls.Add(this.button1);
			base.Controls.Add(this.label1);
			base.Controls.Add(this.selectedFolderTextBox);
			base.FormBorderStyle = global::System.Windows.Forms.FormBorderStyle.None;
			base.Name = "GTAIV";
			base.StartPosition = global::System.Windows.Forms.FormStartPosition.CenterScreen;
			this.Text = "Nightlight Launcher | Grand Theft Auto V";
			base.ResumeLayout(false);
			base.PerformLayout();
		}

		// Token: 0x0400001D RID: 29
		private global::System.ComponentModel.IContainer components = null;

		// Token: 0x0400001E RID: 30
		private global::System.Windows.Forms.TextBox selectedFolderTextBox;

		// Token: 0x0400001F RID: 31
		private global::System.Windows.Forms.Label label1;

		// Token: 0x04000020 RID: 32
		private global::System.Windows.Forms.Button button1;

		// Token: 0x04000021 RID: 33
		private global::System.Windows.Forms.Button button2;

		// Token: 0x04000022 RID: 34
		private global::System.Windows.Forms.Button button3;

		// Token: 0x04000023 RID: 35
		private global::System.Windows.Forms.Label labelOptiBoost1;

		// Token: 0x04000024 RID: 36
		private global::System.Windows.Forms.Button OpenGameLocation;
	}
}
