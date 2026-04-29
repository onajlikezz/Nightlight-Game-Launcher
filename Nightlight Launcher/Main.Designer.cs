namespace Nightlight_Launcher
{
	// Token: 0x02000003 RID: 3
	public partial class Main : global::System.Windows.Forms.Form
	{
		// Token: 0x06000012 RID: 18 RVA: 0x00002CE0 File Offset: 0x00000EE0
		protected override void Dispose(bool disposing)
		{
			bool flag = disposing && this.components != null;
			bool flag2 = flag;
			bool flag3 = flag2;
			bool flag4 = flag3;
			if (flag4)
			{
				this.components.Dispose();
			}
			base.Dispose(disposing);
		}

		// Token: 0x06000013 RID: 19 RVA: 0x00002D20 File Offset: 0x00000F20
		private void InitializeComponent()
		{
			global::System.ComponentModel.ComponentResourceManager componentResourceManager = new global::System.ComponentModel.ComponentResourceManager(typeof(global::Nightlight_Launcher.Main));
			this.panelMain = new global::System.Windows.Forms.Panel();
			this.updatespic = new global::System.Windows.Forms.PictureBox();
			this.discordpic = new global::System.Windows.Forms.PictureBox();
			this.gta4pic = new global::System.Windows.Forms.PictureBox();
			this.rdr2pic = new global::System.Windows.Forms.PictureBox();
			this.gtavpic = new global::System.Windows.Forms.PictureBox();
			this.Updates = new global::System.Windows.Forms.Button();
			this.Discord = new global::System.Windows.Forms.Button();
			this.minecraft = new global::System.Windows.Forms.Button();
			this.RDR2 = new global::System.Windows.Forms.Button();
			this.GTAV = new global::System.Windows.Forms.Button();
			this.panelLogo = new global::System.Windows.Forms.Panel();
			this.label2 = new global::System.Windows.Forms.Label();
			this.label1 = new global::System.Windows.Forms.Label();
			this.panelDisplay = new global::System.Windows.Forms.Panel();
			this.V51 = new global::System.Windows.Forms.Label();
			this.labelOptiBoost1 = new global::System.Windows.Forms.Label();
			this.panelMain.SuspendLayout();
			((global::System.ComponentModel.ISupportInitialize)this.updatespic).BeginInit();
			((global::System.ComponentModel.ISupportInitialize)this.discordpic).BeginInit();
			((global::System.ComponentModel.ISupportInitialize)this.gta4pic).BeginInit();
			((global::System.ComponentModel.ISupportInitialize)this.rdr2pic).BeginInit();
			((global::System.ComponentModel.ISupportInitialize)this.gtavpic).BeginInit();
			this.panelLogo.SuspendLayout();
			this.panelDisplay.SuspendLayout();
			base.SuspendLayout();
			this.panelMain.BackColor = global::System.Drawing.Color.FromArgb(1, 1, 1);
			this.panelMain.Controls.Add(this.updatespic);
			this.panelMain.Controls.Add(this.discordpic);
			this.panelMain.Controls.Add(this.gta4pic);
			this.panelMain.Controls.Add(this.rdr2pic);
			this.panelMain.Controls.Add(this.gtavpic);
			this.panelMain.Controls.Add(this.Updates);
			this.panelMain.Controls.Add(this.Discord);
			this.panelMain.Controls.Add(this.minecraft);
			this.panelMain.Controls.Add(this.RDR2);
			this.panelMain.Controls.Add(this.GTAV);
			this.panelMain.Controls.Add(this.panelLogo);
			this.panelMain.Dock = global::System.Windows.Forms.DockStyle.Left;
			this.panelMain.Location = new global::System.Drawing.Point(0, 0);
			this.panelMain.Name = "panelMain";
			this.panelMain.Size = new global::System.Drawing.Size(161, 501);
			this.panelMain.TabIndex = 1;
			this.updatespic.AccessibleRole = global::System.Windows.Forms.AccessibleRole.None;
			this.updatespic.Enabled = false;
			this.updatespic.Image = global::Nightlight_Launcher.Properties.Resources.githubimg;
			this.updatespic.Location = new global::System.Drawing.Point(12, 226);
			this.updatespic.Name = "updatespic";
			this.updatespic.Size = new global::System.Drawing.Size(25, 26);
			this.updatespic.SizeMode = global::System.Windows.Forms.PictureBoxSizeMode.StretchImage;
			this.updatespic.TabIndex = 23;
			this.updatespic.TabStop = false;
			this.discordpic.AccessibleRole = global::System.Windows.Forms.AccessibleRole.None;
			this.discordpic.Enabled = false;
			this.discordpic.Image = global::Nightlight_Launcher.Properties.Resources.discordimg;
			this.discordpic.Location = new global::System.Drawing.Point(12, 190);
			this.discordpic.Name = "discordpic";
			this.discordpic.Size = new global::System.Drawing.Size(25, 26);
			this.discordpic.SizeMode = global::System.Windows.Forms.PictureBoxSizeMode.StretchImage;
			this.discordpic.TabIndex = 22;
			this.discordpic.TabStop = false;
			this.gta4pic.AccessibleRole = global::System.Windows.Forms.AccessibleRole.None;
			this.gta4pic.Enabled = false;
			this.gta4pic.Image = global::Nightlight_Launcher.Properties.Resources.gta4img;
			this.gta4pic.Location = new global::System.Drawing.Point(12, 154);
			this.gta4pic.Name = "gta4pic";
			this.gta4pic.Size = new global::System.Drawing.Size(25, 26);
			this.gta4pic.SizeMode = global::System.Windows.Forms.PictureBoxSizeMode.StretchImage;
			this.gta4pic.TabIndex = 21;
			this.gta4pic.TabStop = false;
			this.rdr2pic.AccessibleRole = global::System.Windows.Forms.AccessibleRole.None;
			this.rdr2pic.Enabled = false;
			this.rdr2pic.Image = global::Nightlight_Launcher.Properties.Resources.rdr2img;
			this.rdr2pic.Location = new global::System.Drawing.Point(12, 118);
			this.rdr2pic.Name = "rdr2pic";
			this.rdr2pic.Size = new global::System.Drawing.Size(25, 26);
			this.rdr2pic.SizeMode = global::System.Windows.Forms.PictureBoxSizeMode.StretchImage;
			this.rdr2pic.TabIndex = 20;
			this.rdr2pic.TabStop = false;
			this.gtavpic.AccessibleRole = global::System.Windows.Forms.AccessibleRole.None;
			this.gtavpic.Enabled = false;
			this.gtavpic.Image = global::Nightlight_Launcher.Properties.Resources.gta5img;
			this.gtavpic.Location = new global::System.Drawing.Point(12, 83);
			this.gtavpic.Name = "gtavpic";
			this.gtavpic.Size = new global::System.Drawing.Size(25, 26);
			this.gtavpic.SizeMode = global::System.Windows.Forms.PictureBoxSizeMode.StretchImage;
			this.gtavpic.TabIndex = 2;
			this.gtavpic.TabStop = false;
			this.Updates.Dock = global::System.Windows.Forms.DockStyle.Top;
			this.Updates.FlatStyle = global::System.Windows.Forms.FlatStyle.Popup;
			this.Updates.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 9.75f, global::System.Drawing.FontStyle.Bold);
			this.Updates.ForeColor = global::System.Drawing.Color.FromArgb(128, 128, 255);
			this.Updates.ImageAlign = global::System.Drawing.ContentAlignment.MiddleLeft;
			this.Updates.Location = new global::System.Drawing.Point(0, 221);
			this.Updates.Name = "Updates";
			this.Updates.Size = new global::System.Drawing.Size(161, 36);
			this.Updates.TabIndex = 19;
			this.Updates.Text = "Updates";
			this.Updates.UseVisualStyleBackColor = true;
			this.Updates.Click += new global::System.EventHandler(this.Updates_Click);
			this.Discord.Dock = global::System.Windows.Forms.DockStyle.Top;
			this.Discord.FlatStyle = global::System.Windows.Forms.FlatStyle.Popup;
			this.Discord.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 9.75f, global::System.Drawing.FontStyle.Bold);
			this.Discord.ForeColor = global::System.Drawing.Color.FromArgb(128, 128, 255);
			this.Discord.Location = new global::System.Drawing.Point(0, 185);
			this.Discord.Name = "Discord";
			this.Discord.Size = new global::System.Drawing.Size(161, 36);
			this.Discord.TabIndex = 17;
			this.Discord.Text = "Discord";
			this.Discord.UseVisualStyleBackColor = true;
			this.Discord.Click += new global::System.EventHandler(this.Discord_Click);
			this.minecraft.Dock = global::System.Windows.Forms.DockStyle.Top;
			this.minecraft.FlatStyle = global::System.Windows.Forms.FlatStyle.Popup;
			this.minecraft.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 9.75f, global::System.Drawing.FontStyle.Bold);
			this.minecraft.ForeColor = global::System.Drawing.SystemColors.Window;
			this.minecraft.Location = new global::System.Drawing.Point(0, 149);
			this.minecraft.Name = "minecraft";
			this.minecraft.Size = new global::System.Drawing.Size(161, 36);
			this.minecraft.TabIndex = 16;
			this.minecraft.Text = "GTA IV";
			this.minecraft.UseVisualStyleBackColor = true;
			this.minecraft.Click += new global::System.EventHandler(this.gtaiv_Click);
			this.RDR2.Dock = global::System.Windows.Forms.DockStyle.Top;
			this.RDR2.FlatStyle = global::System.Windows.Forms.FlatStyle.Popup;
			this.RDR2.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 9.75f, global::System.Drawing.FontStyle.Bold);
			this.RDR2.ForeColor = global::System.Drawing.SystemColors.Window;
			this.RDR2.Location = new global::System.Drawing.Point(0, 113);
			this.RDR2.Name = "RDR2";
			this.RDR2.Size = new global::System.Drawing.Size(161, 36);
			this.RDR2.TabIndex = 8;
			this.RDR2.Text = "RDR II";
			this.RDR2.UseVisualStyleBackColor = true;
			this.RDR2.Click += new global::System.EventHandler(this.RDR2_Click);
			this.GTAV.Dock = global::System.Windows.Forms.DockStyle.Top;
			this.GTAV.FlatStyle = global::System.Windows.Forms.FlatStyle.Popup;
			this.GTAV.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 9.75f, global::System.Drawing.FontStyle.Bold);
			this.GTAV.ForeColor = global::System.Drawing.SystemColors.Window;
			this.GTAV.Location = new global::System.Drawing.Point(0, 78);
			this.GTAV.Name = "GTAV";
			this.GTAV.Size = new global::System.Drawing.Size(161, 35);
			this.GTAV.TabIndex = 6;
			this.GTAV.Text = "GTA V";
			this.GTAV.UseVisualStyleBackColor = true;
			this.GTAV.Click += new global::System.EventHandler(this.GTAV_Click);
			this.panelLogo.BackColor = global::System.Drawing.Color.FromArgb(1, 1, 1);
			this.panelLogo.Controls.Add(this.label2);
			this.panelLogo.Controls.Add(this.label1);
			this.panelLogo.Dock = global::System.Windows.Forms.DockStyle.Top;
			this.panelLogo.Location = new global::System.Drawing.Point(0, 0);
			this.panelLogo.Name = "panelLogo";
			this.panelLogo.Size = new global::System.Drawing.Size(161, 78);
			this.panelLogo.TabIndex = 0;
			this.label2.AutoSize = true;
			this.label2.BackColor = global::System.Drawing.Color.Transparent;
			this.label2.Font = new global::System.Drawing.Font("Comic Sans MS", 8.25f, global::System.Drawing.FontStyle.Bold, global::System.Drawing.GraphicsUnit.Point, 0);
			this.label2.ForeColor = global::System.Drawing.Color.WhiteSmoke;
			this.label2.Location = new global::System.Drawing.Point(120, 46);
			this.label2.Name = "label2";
			this.label2.Size = new global::System.Drawing.Size(22, 16);
			this.label2.TabIndex = 2;
			this.label2.Text = "V4";
			this.label1.AutoSize = true;
			this.label1.BackColor = global::System.Drawing.Color.Transparent;
			this.label1.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 10f, global::System.Drawing.FontStyle.Bold, global::System.Drawing.GraphicsUnit.Point, 0);
			this.label1.ForeColor = global::System.Drawing.Color.WhiteSmoke;
			this.label1.Location = new global::System.Drawing.Point(3, 27);
			this.label1.Name = "label1";
			this.label1.Size = new global::System.Drawing.Size(151, 19);
			this.label1.TabIndex = 1;
			this.label1.Text = "Nightlight Launcher";
			this.panelDisplay.BackColor = global::System.Drawing.Color.FromArgb(23, 21, 35);
			this.panelDisplay.Controls.Add(this.V51);
			this.panelDisplay.Controls.Add(this.labelOptiBoost1);
			this.panelDisplay.Dock = global::System.Windows.Forms.DockStyle.Fill;
			this.panelDisplay.Location = new global::System.Drawing.Point(161, 0);
			this.panelDisplay.Name = "panelDisplay";
			this.panelDisplay.Size = new global::System.Drawing.Size(695, 501);
			this.panelDisplay.TabIndex = 2;
			this.V51.AutoSize = true;
			this.V51.BackColor = global::System.Drawing.Color.Transparent;
			this.V51.FlatStyle = global::System.Windows.Forms.FlatStyle.Flat;
			this.V51.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 12f, global::System.Drawing.FontStyle.Bold);
			this.V51.ForeColor = global::System.Drawing.Color.WhiteSmoke;
			this.V51.Location = new global::System.Drawing.Point(327, 221);
			this.V51.Name = "V51";
			this.V51.Size = new global::System.Drawing.Size(31, 22);
			this.V51.TabIndex = 1;
			this.V51.Text = "V4";
			this.labelOptiBoost1.AutoSize = true;
			this.labelOptiBoost1.BackColor = global::System.Drawing.Color.Transparent;
			this.labelOptiBoost1.Font = new global::System.Drawing.Font("Mont Heavy DEMO", 24f, global::System.Drawing.FontStyle.Bold);
			this.labelOptiBoost1.ForeColor = global::System.Drawing.Color.WhiteSmoke;
			this.labelOptiBoost1.Location = new global::System.Drawing.Point(161, 185);
			this.labelOptiBoost1.Name = "labelOptiBoost1";
			this.labelOptiBoost1.Size = new global::System.Drawing.Size(351, 44);
			this.labelOptiBoost1.TabIndex = 0;
			this.labelOptiBoost1.Text = "Nightlight Launcher";
			base.AutoScaleDimensions = new global::System.Drawing.SizeF(6f, 13f);
			base.AutoScaleMode = global::System.Windows.Forms.AutoScaleMode.Font;
			base.ClientSize = new global::System.Drawing.Size(856, 501);
			base.Controls.Add(this.panelDisplay);
			base.Controls.Add(this.panelMain);
			base.Icon = (global::System.Drawing.Icon)componentResourceManager.GetObject("$this.Icon");
			base.Name = "Main";
			this.Text = "Nightlight Game Launcher | Version 4";
			this.panelMain.ResumeLayout(false);
			((global::System.ComponentModel.ISupportInitialize)this.updatespic).EndInit();
			((global::System.ComponentModel.ISupportInitialize)this.discordpic).EndInit();
			((global::System.ComponentModel.ISupportInitialize)this.gta4pic).EndInit();
			((global::System.ComponentModel.ISupportInitialize)this.rdr2pic).EndInit();
			((global::System.ComponentModel.ISupportInitialize)this.gtavpic).EndInit();
			this.panelLogo.ResumeLayout(false);
			this.panelLogo.PerformLayout();
			this.panelDisplay.ResumeLayout(false);
			this.panelDisplay.PerformLayout();
			base.ResumeLayout(false);
		}

		// Token: 0x0400000A RID: 10
		private global::System.ComponentModel.IContainer components = null;

		// Token: 0x0400000B RID: 11
		private global::System.Windows.Forms.Panel panelMain;

		// Token: 0x0400000C RID: 12
		private global::System.Windows.Forms.Button RDR2;

		// Token: 0x0400000D RID: 13
		private global::System.Windows.Forms.Button GTAV;

		// Token: 0x0400000E RID: 14
		private global::System.Windows.Forms.Panel panelLogo;

		// Token: 0x0400000F RID: 15
		private global::System.Windows.Forms.Label label2;

		// Token: 0x04000010 RID: 16
		private global::System.Windows.Forms.Label label1;

		// Token: 0x04000011 RID: 17
		private global::System.Windows.Forms.Panel panelDisplay;

		// Token: 0x04000012 RID: 18
		private global::System.Windows.Forms.Label V51;

		// Token: 0x04000013 RID: 19
		private global::System.Windows.Forms.Label labelOptiBoost1;

		// Token: 0x04000014 RID: 20
		private global::System.Windows.Forms.Button Discord;

		// Token: 0x04000015 RID: 21
		private global::System.Windows.Forms.Button minecraft;

		// Token: 0x04000016 RID: 22
		private global::System.Windows.Forms.Button Updates;

		// Token: 0x04000017 RID: 23
		private global::System.Windows.Forms.PictureBox updatespic;

		// Token: 0x04000018 RID: 24
		private global::System.Windows.Forms.PictureBox discordpic;

		// Token: 0x04000019 RID: 25
		private global::System.Windows.Forms.PictureBox gta4pic;

		// Token: 0x0400001A RID: 26
		private global::System.Windows.Forms.PictureBox rdr2pic;

		// Token: 0x0400001B RID: 27
		private global::System.Windows.Forms.PictureBox gtavpic;
	}
}
